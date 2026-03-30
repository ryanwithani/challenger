import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

async function resetPasswordHandler(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Email length validation
        if (email.length > 254) {
            return NextResponse.json(
                { error: 'Email address is too long' },
                { status: 400 }
            )
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServerClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        })

        if (error) {
            console.error('Password reset error:', error)
            // Log for monitoring but don't expose to user
        }

        // Always return success to prevent email enumeration
        return NextResponse.json({
            success: true,
            message: 'If an account exists, a reset email has been sent.'
        })

    } catch (error) {
        return NextResponse.json({ error: 'Request failed. Please try again.' }, { status: 500 })
    }
}

// Note: reset-password is excluded from CSRF protection in the middleware
// as it's a public endpoint, but you can still wrap it if needed
export const POST = resetPasswordHandler