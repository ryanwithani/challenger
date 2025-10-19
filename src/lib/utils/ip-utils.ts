import { NextRequest } from 'next/server'

/**
 * Extract client IP address from request headers
 * Handles various proxy configurations (Cloudflare, load balancers, etc.)
 */
export function getClientIP(request: NextRequest): string {
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
