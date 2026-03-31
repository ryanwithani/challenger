import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { withCSRFProtection } from '@/src/lib/middleware/csrf'
import { passwordSchema, emailSchema, usernameSchema, PASSWORD_MIN } from '@/src/lib/utils/validators'
async function signupHandler(request: NextRequest) {
  try {
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

    // Create user profile — required, not optional
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          username: usernameTrimmed,
          display_name: usernameTrimmed,
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        return NextResponse.json(
          { error: `Profile creation failed: ${profileError.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Account created successfully'
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Signup failed: ${message}` },
      { status: 500 }
    )
  }
}

// CSRF protection enabled for signup to prevent automated attacks
export const POST = withCSRFProtection(signupHandler)