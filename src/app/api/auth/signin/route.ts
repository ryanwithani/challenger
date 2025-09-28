import { NextRequest, NextResponse } from 'next/server'
import rateLimit from '@/src/lib/utils/rateLimit'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

const limiter = rateLimit({
    interval: 15 * 60 * 1000, // 15 minutes
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

    // Fallback to connection info (may not be available in all deployments)
    return 'unknown'
}

export async function POST(request: NextRequest) {
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

        const supabase = createSupabaseBrowserClient()
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