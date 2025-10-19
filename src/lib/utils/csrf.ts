import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// CSRF token configuration
const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_TOKEN_LENGTH = 32
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Set CSRF token in HTTP-only cookie
 */
export function setCSRFTokenCookie(response: Response, token: string): void {
    response.headers.set(
        'Set-Cookie',
        `${CSRF_TOKEN_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${CSRF_TOKEN_EXPIRY / 1000}; Path=/`
    )
}

/**
 * Get CSRF token from request headers or cookies
 */
export function getCSRFToken(request: NextRequest): string | null {
    // Check X-CSRF-Token header first (preferred for AJAX requests)
    const headerToken = request.headers.get('X-CSRF-Token')
    if (headerToken) {
        return headerToken
    }

    // Fallback to cookie (for form submissions)
    const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value
    return cookieToken || null
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(request: NextRequest): boolean {
    const token = getCSRFToken(request)
    if (!token) {
        return false
    }

    // Basic token format validation
    if (token.length !== CSRF_TOKEN_LENGTH * 2) { // hex string is 2x the byte length
        return false
    }

    // Check if token is valid hex
    if (!/^[a-f0-9]+$/i.test(token)) {
        return false
    }

    return true
}

/**
 * Create CSRF error response
 */
export function createCSRFErrorResponse(): Response {
    return new Response(
        JSON.stringify({ error: 'Invalid CSRF token' }),
        {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
}
