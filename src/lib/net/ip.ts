// src/lib/net/ip.ts
import type { NextRequest } from 'next/server'
import { ipAddress } from '@vercel/functions'

export function getClientIP(req: NextRequest): string {
  // Prefer Vercel helper (works on Vercel)
  try {
    const ip = ipAddress(req)
    if (ip) return ip
  } catch { /* not on Vercel or older Next */ }

  // Generic fallbacks for other hosts / local dev
  const xff = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (xff) return xff
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri

  // As a last resort (avoid request.ip — it’s gone)
  return '0.0.0.0'
}
