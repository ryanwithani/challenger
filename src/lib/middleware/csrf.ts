import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken, createCSRFErrorResponse } from '@/src/lib/utils/csrf'

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(handler: Function) {
    return async (request: NextRequest, ...args: any[]) => {
        // Skip CSRF validation for GET requests
        if (request.method === 'GET') {
            return handler(request, ...args)
        }

        // Skip CSRF validation for public endpoints (like password reset)
        const publicEndpoints = ['/api/auth/reset-password']
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
            request.nextUrl.pathname.startsWith(endpoint)
        )

        if (isPublicEndpoint) {
            return handler(request, ...args)
        }

        // Validate CSRF token for all other POST/PUT/DELETE requests
        if (!validateCSRFToken(request)) {
            return createCSRFErrorResponse()
        }

        return handler(request, ...args)
    }
}
