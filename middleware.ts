import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getClientIP } from '@/src/lib/net/ip'

const redis = Redis.fromEnv()
const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '10s') })

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname
  // Tighter limits on auth + write endpoints
  if (pathname.startsWith('/api/auth') || (pathname.startsWith('/api') && request.method !== 'GET')) {
    const { success } = await limiter.limit(`${ip}:${pathname}`)
    if (!success) return new NextResponse('Too Many Requests', { status: 429 })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check auth for protected routes
  const protectedPaths = ['/dashboard', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    const { data: { user } } = await supabase.auth.getUser()

    // Not authenticated
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check email verification
    if (user && !user.email_confirmed_at) {
      // Allow access to verify-email page
      if (!request.nextUrl.pathname.startsWith('/auth/verify-email')) {
        return NextResponse.redirect(new URL('/auth/verify-email', request.url))
      }
    }
  }

  // If user is logged in but email not verified, redirect from auth pages to verify-email
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && !user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }
    
    // If already logged in and verified, redirect to dashboard
    if (user && user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
