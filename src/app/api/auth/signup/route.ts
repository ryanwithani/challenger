import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { withCSRFProtection } from '@/src/lib/middleware/csrf'
import { passwordSchema, emailSchema, usernameSchema, PASSWORD_MIN } from '@/src/lib/utils/validators'
import rateLimit from '@/src/lib/utils/rateLimit'
import { getClientIP } from '@/src/lib/utils/ip-utils'

const signupLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
})

async function signupHandler(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)

    // Rate limiting: 3 signups per hour per IP
    await signupLimiter.check(3, clientIP)

    const { username, email, password, website } = await request.json()

    // Honeypot check
    if (website) {
      // Silent rejection - looks like success to bot
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Username validation using Zod
    const usernameValidation = usernameSchema.safeParse(username)
    if (!usernameValidation.success) {
      return NextResponse.json(
        { field: 'username', error: usernameValidation.error.errors[0].message },
        { status: 400 }
      )
    }
    const usernameTrimmed = usernameValidation.data

    // Email validation
    const emailValidation = emailSchema.safeParse(email)
    if (!emailValidation.success) {
      return NextResponse.json(
        { field: 'email', error: emailValidation.error.errors[0].message },
        { status: 400 }
      )
    }

    // Password validation
    const passwordValidation = passwordSchema.safeParse(password)
    if (!passwordValidation.success) {
      return NextResponse.json(
        { field: 'password', error: passwordValidation.error.errors[0].message },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .ilike('username', usernameTrimmed)
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json(
        { field: 'username', error: 'This username is already taken' },
        { status: 400 }
      )
    }

    // Create user account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailValidation.data,
      password: passwordValidation.data,
      options: {
        data: {
          username: usernameTrimmed,
        },
      },
    })

    if (signUpError) {
      // Handle specific Supabase errors
      if (signUpError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { field: 'email', error: 'This email is already registered' },
          { status: 400 }
        )
      }

      if (signUpError.message.toLowerCase().includes('invalid email')) {
        return NextResponse.json(
          { field: 'email', error: 'Please enter a valid email address' },
          { status: 400 }
        )
      }

      throw signUpError
    }

    // Create user profile in users table if user was created successfully
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          username: usernameTrimmed,
          display_name: usernameTrimmed, // Use username as initial display name
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Failed to create user profile:', profileError)
        // Don't fail the signup if profile creation fails - user can still sign in
        // The profile will be created on first login via the auth store
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account created successfully'
    })

  } catch (rateLimitError: any) {
    if (rateLimitError.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again in an hour.' },
        {
          status: 429,
          headers: { 'Retry-After': '3600' }
        }
      )
    }

    console.error('Signup error:', rateLimitError)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

// CSRF protection enabled for signup to prevent automated attacks
export const POST = withCSRFProtection(signupHandler)