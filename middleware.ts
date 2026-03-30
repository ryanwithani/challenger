import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getClientIP } from '@/src/lib/utils/ip-utils'
import { generateCSRFToken, setCSRFTokenCookie } from '@/src/lib/utils/csrf'

const redis = Redis.fromEnv()
const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10s') })

const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings']
const AUTH_PAGES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Rate limit auth + write endpoints
  if (pathname.startsWith('/api/auth') || (pathname.startsWith('/api') && request.method !== 'GET')) {
    const { success } = await limiter.limit(`${ip}:${pathname}`)
    if (!success) return new NextResponse('Too Many Requests', { status: 429 })
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create Supabase client once for all auth checks
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

  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  const isAuthPage = AUTH_PAGES.some(path => pathname.startsWith(path))

  // Only call getUser() when we actually need auth info
  if (isProtectedPath || isAuthPage) {
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
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/auth/(.*)',
  ],
}
