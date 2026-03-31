import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getClientIP } from '@/src/lib/utils/ip-utils'
import { generateCSRFToken, setCSRFTokenCookie } from '@/src/lib/utils/csrf'

// Rate limiter is optional — fail open if Upstash env vars are missing
let limiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null

try {
  const { Ratelimit } = require('@upstash/ratelimit')
  const { Redis } = require('@upstash/redis')
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = Redis.fromEnv()
    limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10s') })
  }
} catch {
  // Upstash packages not available or misconfigured — rate limiting disabled
}

const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings', '/challenge', '/sim']
const AUTH_PAGES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Rate limit auth + write endpoints (fail-open if Redis unavailable)
  if (limiter && (pathname.startsWith('/api/auth') || (pathname.startsWith('/api') && request.method !== 'GET'))) {
    try {
      const { success } = await limiter.limit(`${ip}:${pathname}`)
      if (!success) return new NextResponse('Too Many Requests', { status: 429 })
    } catch {
      // Redis unreachable — allow request through
    }
  }

  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  const isAuthPage = AUTH_PAGES.some(path => pathname.startsWith(path))

  // API routes only need rate limiting (handled above) — skip Supabase client
  if (!isProtectedPath && !isAuthPage) {
    return NextResponse.next({ request: { headers: request.headers } })
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtectedPath) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!user.email_confirmed_at && !pathname.startsWith('/auth/verify-email')) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }

    // Generate CSRF token for authenticated users if not already set
    if (!request.cookies.get('csrf-token')) {
      const token = generateCSRFToken()
      setCSRFTokenCookie(response, token)
    }
  }

  if (isAuthPage && user) {
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/challenge/:path*',
    '/sim/:path*',
    '/login',
    '/register',
    '/api/auth/:path*',
  ],
}
