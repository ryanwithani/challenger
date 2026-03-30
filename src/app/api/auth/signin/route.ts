import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { withCSRFProtection } from '@/src/lib/middleware/csrf'
import { z } from 'zod'
import { emailSchema } from '@/src/lib/utils/validators'
import { PASSWORD_REGEX } from '@/src/lib/utils/validators'
import { PASSWORD_MIN } from '@/src/lib/utils/validators'

async function signinHandler(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
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

        // Password length validation
        if (password.length > 128) {
            return NextResponse.json(
                { error: 'Password is too long' },
                { status: 400 }
            )
        }

        const supabase = await createSupabaseServerClient()
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user: data.user
        })

    } catch (error) {
        return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 })
    }
}

// Export the CSRF-protected handler
export const POST = withCSRFProtection(signinHandler)