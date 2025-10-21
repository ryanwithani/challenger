import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { withCSRFProtection } from '@/src/lib/middleware/csrf'
import { passwordSchema, emailSchema, PASSWORD_MIN } from '@/src/lib/utils/validators'
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

    // Username validation
    const usernameTrimmed = username.trim()
    if (usernameTrimmed.length < 3 || usernameTrimmed.length > 20) {
      return NextResponse.json(
        { field: 'username', error: 'Username must be 3-20 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-z0-9_-]+$/i.test(usernameTrimmed)) {
      return NextResponse.json(
        { field: 'username', error: 'Username can only contain letters, numbers, - and _' },
        { status: 400 }
      )
    }

    const reserved = ['admin', 'root', 'system', 'mod', 'moderator', 'support', 'help']
    if (reserved.includes(usernameTrimmed.toLowerCase())) {
      return NextResponse.json(
        { field: 'username', error: 'This username is reserved' },
        { status: 400 }
      )
    }

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

// Note: signup is typically excluded from CSRF protection as it's a registration flow
// If you want CSRF protection, wrap with: export const POST = withCSRFProtection(signupHandler)
export const POST = signupHandler