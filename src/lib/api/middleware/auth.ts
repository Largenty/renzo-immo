/**
 * API Authentication Middleware
 * Centralizes authentication logic for all API routes
 *
 * Benefits:
 * - Consistent auth across all routes
 * - Eliminates 324 lines of duplication
 * - Easier to add new auth requirements
 * - Better security (single point of maintenance)
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Authenticated request with user and supabase client attached
 */
export interface AuthenticatedRequest extends NextRequest {
  user: User
  supabase: SupabaseClient
}

/**
 * Handler function that receives authenticated request
 */
export type AuthenticatedHandler = (
  request: AuthenticatedRequest
) => Promise<NextResponse>

/**
 * Options for authentication middleware
 */
export interface AuthMiddlewareOptions {
  /** Require email to be verified */
  requireEmailVerification?: boolean
  /** Require admin role */
  requireAdmin?: boolean
  /** Custom role check function */
  requireRole?: (user: User, supabase: SupabaseClient) => Promise<boolean>
}

/**
 * Authentication middleware for API routes
 *
 * @example
 * ```typescript
 * export const POST = withAuth(
 *   async (request) => {
 *     const { user, supabase } = request
 *     // Your authenticated logic here
 *     return NextResponse.json({ success: true })
 *   },
 *   { requireEmailVerification: true }
 * )
 * ```
 */
export function withAuth(
  handler: AuthenticatedHandler,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Create Supabase client
      const supabase = await createClient()

      // 2. Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        logger.warn('[withAuth] Authentication error', {
          error: authError.message,
          path: request.nextUrl.pathname,
        })
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication failed' },
          { status: 401 }
        )
      }

      if (!user) {
        logger.warn('[withAuth] No user found', {
          path: request.nextUrl.pathname,
        })
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Please sign in to continue' },
          { status: 401 }
        )
      }

      // 3. Email verification check
      if (options.requireEmailVerification && !user.email_confirmed_at) {
        logger.warn('[withAuth] Email not verified', {
          userId: user.id,
          email: user.email,
        })
        return NextResponse.json(
          {
            error: 'Email verification required',
            message: 'Please verify your email address to access this resource',
          },
          { status: 403 }
        )
      }

      // 4. Admin role check
      if (options.requireAdmin) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          logger.error('[withAuth] Failed to fetch user profile', {
            userId: user.id,
            error: profileError,
          })
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }

        if (profile?.role !== 'admin') {
          logger.warn('[withAuth] Admin access denied', {
            userId: user.id,
            role: profile?.role,
          })
          return NextResponse.json(
            { error: 'Forbidden', message: 'Admin access required' },
            { status: 403 }
          )
        }
      }

      // 5. Custom role check
      if (options.requireRole) {
        const hasAccess = await options.requireRole(user, supabase)
        if (!hasAccess) {
          logger.warn('[withAuth] Custom role check failed', {
            userId: user.id,
          })
          return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }

      // 6. Attach user and supabase to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = user
      authenticatedRequest.supabase = supabase

      // 7. Log successful authentication
      logger.debug('[withAuth] Authentication successful', {
        userId: user.id,
        path: request.nextUrl.pathname,
      })

      // 8. Call the actual handler
      return await handler(authenticatedRequest)
    } catch (error: any) {
      logger.error('[withAuth] Unexpected error', {
        error: error.message,
        stack: error.stack,
        path: request.nextUrl.pathname,
      })
      return NextResponse.json(
        { error: 'Internal server error', message: 'An unexpected error occurred' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to compose multiple middleware functions
 *
 * @example
 * ```typescript
 * export const POST = composeMiddleware(
 *   withAuth,
 *   withRateLimit,
 *   withValidation(schema)
 * )(async (request) => {
 *   // Handler logic
 * })
 * ```
 */
export function composeMiddleware(...middlewares: any[]) {
  return (handler: any) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    )
  }
}
