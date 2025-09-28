import { NextRequest, NextResponse } from 'next/server'
import rateLimit from '@/src/lib/utils/rateLimit'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

const resetLimiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 hour
    uniqueTokenPerInterval: 500,
})

function getClientIP(request: NextRequest): string {
    // Check headers in order of preference
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare

    if (cfConnectingIP) return cfConnectingIP.trim()
    if (forwarded) return forwarded.split(',')[0].trim()
    if (realIP) return realIP.trim()

    return 'unknown'
}

export async function POST(request: NextRequest) {
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

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        const supabase = createSupabaseBrowserClient()
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