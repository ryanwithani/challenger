import { NextRequest, NextResponse } from 'next/server'
import rateLimit from '@/src/lib/utils/rateLimit'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { getClientIP } from '@/src/lib/utils/ip-utils'

const resetLimiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 500,
})

async function resetPasswordHandler(request: NextRequest) {
    try {
        const clientIP = getClientIP(request)

        // Rate limiting: 3 attempts per hour per IP
        await resetLimiter.check(3, clientIP)

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

    } catch (rateLimitError) {
        return NextResponse.json(
            { error: 'Too many reset attempts. Please try again in an hour.' },
            {
                status: 429,
                headers: {
                    'Retry-After': '3600',
                    'X-RateLimit-Limit': '3',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 3600)
                }
            }
        )
    }
}

// Note: reset-password is excluded from CSRF protection in the middleware
// as it's a public endpoint, but you can still wrap it if needed
export const POST = resetPasswordHandler