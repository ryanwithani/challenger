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

/**
 * Client-side CSRF token management
 */
class CSRFTokenManager {
    private token: string | null = null
    private tokenPromise: Promise<string> | null = null

    /**
     * Get CSRF token, fetching if not available
     */
    async getToken(): Promise<string> {
        if (this.token) {
            return this.token
        }

        if (this.tokenPromise) {
            return this.tokenPromise
        }

        this.tokenPromise = this.fetchToken()
        this.token = await this.tokenPromise
        this.tokenPromise = null

        return this.token
    }

    /**
     * Fetch CSRF token from server
     */
    private async fetchToken(): Promise<string> {
        try {
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'include', // Include cookies
            })

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token')
            }

            const data = await response.json()
            return data.token
        } catch (error) {
            console.error('CSRF token fetch error:', error)
            throw error
        }
    }

    /**
     * Clear stored token (call on logout)
     */
    clearToken(): void {
        this.token = null
        this.tokenPromise = null
    }

    /**
     * Get headers for API requests
     */
    async getHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken()
        return {
            'X-CSRF-Token': token,
            'Content-Type': 'application/json',
        }
    }
}

export const csrfTokenManager = new CSRFTokenManager()
