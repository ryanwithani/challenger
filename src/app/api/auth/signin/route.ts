import { NextRequest, NextResponse } from 'next/server'
import rateLimit from '@/src/lib/utils/rateLimit'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { withCSRFProtection } from '@/src/lib/middleware/csrf'
import { z } from 'zod'
import { emailSchema } from '@/src/lib/utils/validators'
import { PASSWORD_REGEX } from '@/src/lib/utils/validators'
import { PASSWORD_MIN } from '@/src/lib/utils/validators'
import { getClientIP } from '@/src/lib/utils/ip-utils'

const limiter = rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 500,
})

async function signinHandler(request: NextRequest) {
    try {
        const clientIP = getClientIP(request)

        // Rate limiting: 5 attempts per 15 minutes per IP
        await limiter.check(5, clientIP)

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

    } catch (rateLimitError) {
        return NextResponse.json(
            { error: 'Too many login attempts. Please try again in 15 minutes.' },
            {
                status: 429,
                headers: { 'Retry-After': '900' }
            }
        )
    }
}

// Export the CSRF-protected handler
export const POST = withCSRFProtection(signinHandler)