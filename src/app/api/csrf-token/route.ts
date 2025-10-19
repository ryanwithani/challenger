import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken, setCSRFTokenCookie } from '@/src/lib/utils/csrf'

export async function GET(request: NextRequest) {
    try {
        const token = generateCSRFToken()
        const response = NextResponse.json({ token })

        // Set the token in an HTTP-only cookie
        setCSRFTokenCookie(response, token)

        return response
    } catch (error) {
        console.error('CSRF token generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate CSRF token' },
            { status: 500 }
        )
    }
}
