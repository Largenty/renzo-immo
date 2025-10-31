/**
 * Next.js Middleware
 * Gère l'authentification, les redirections et la sécurité
 */

import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Supabase auth middleware (session refresh)
  const response = await updateSession(request)

  // 2. Add security headers
  addSecurityHeaders(response)

  return response
}

/**
 * Add security headers to response
 * Protects against XSS, clickjacking, MIME sniffing, etc.
 */
function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: Allow self + unsafe-inline/eval for Next.js
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.sentry.io https://*.sentry-cdn.com",
    // Styles: Allow self + unsafe-inline for Tailwind
    "style-src 'self' 'unsafe-inline'",
    // Images: Allow self + data URIs + external CDNs
    "img-src 'self' data: https: blob:",
    // Fonts: Allow self + data URIs
    "font-src 'self' data:",
    // Connect (API calls): Allow self + Supabase + NanoBanana + Sentry + Upstash
    "connect-src 'self' https://*.supabase.co https://api.nanobananaapi.ai https://*.upstash.io https://*.sentry.io wss://*.supabase.co",
    // Frames: Deny all iframes
    "frame-src 'none'",
    // Frame ancestors: Prevent clickjacking
    "frame-ancestors 'none'",
    // Form actions: Only allow same origin
    "form-action 'self'",
    // Base URI: Only allow same origin
    "base-uri 'self'",
    // Object/embed: Deny plugins
    "object-src 'none'",
    // Upgrade insecure requests (HTTP → HTTPS)
    "upgrade-insecure-requests",
  ]

  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  )

  // X-Frame-Options: Prevent clickjacking (legacy support)
  response.headers.set('X-Frame-Options', 'DENY')

  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions-Policy: Disable unnecessary browser features
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC (Google tracking)
      'payment=()',
      'usb=()',
      'serial=()',
    ].join(', ')
  )

  // X-XSS-Protection: Enable XSS filter (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Strict-Transport-Security: Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
