/**
 * Supabase Middleware
 * Refresh les sessions automatiquement
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function updateSession(request: NextRequest) {
  // Créer une réponse initiale
  const response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            // ✅ CSRF PROTECTION: Configurer les cookies avec les options de sécurité
            const secureOptions = {
              ...options,
              sameSite: 'lax' as const, // Protection CSRF
              httpOnly: true, // Protection XSS
              secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
              path: '/', // Accessible sur tout le site
            }

            request.cookies.set(name, value)
            response.cookies.set(name, value, secureOptions)
          })
        },
      },
    }
  )

  // Refresh session si elle existe
  const {
    data: { user },
  } = await supabase.auth.getUser()

  logger.debug('[Middleware] Path:', request.nextUrl.pathname, 'User:', user ? 'authenticated' : 'not authenticated')

  // Protection des routes dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    logger.debug('[Middleware] Redirecting to login from:', request.nextUrl.pathname)
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ EMAIL VERIFICATION: Vérifier que l'email est confirmé pour accéder au dashboard
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Vérifier si l'email est confirmé (Supabase Auth utilise 'confirmed_at')
    if (!user.confirmed_at) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/verify-email'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirection si déjà connecté et tentative d'accès aux pages auth (signup ou login)
  if (user && (request.nextUrl.pathname === '/auth/signup' || request.nextUrl.pathname === '/auth/login')) {
    // Si email non vérifié, rediriger vers verify-email
    if (!user.confirmed_at) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/verify-email'
      return NextResponse.redirect(redirectUrl)
    }

    // Si email vérifié, rediriger vers dashboard
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
