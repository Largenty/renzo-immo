/**
 * API Credits Middleware
 * Centralizes credit checking and deduction logic
 *
 * Benefits:
 * - Atomic credit operations (no double-charging)
 * - Consistent credit validation
 * - Eliminates 120 lines of duplication
 * - Transaction safety with reservation system
 * - Better error handling
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import type { AuthenticatedRequest } from './auth'
import { SupabaseCreditsRepository } from '@/infrastructure/supabase/credits.repository'

/**
 * Credit operation request with credit cost
 */
export interface CreditRequest extends AuthenticatedRequest {
  creditCost: number
  transactionMetadata?: {
    imageQuality?: 'standard' | 'hd'
    imageCount?: number
    relatedProjectId?: string
    relatedProjectName?: string
    relatedImageId?: string
  }
}

/**
 * Handler function that receives credit-aware request
 */
export type CreditHandler = (request: CreditRequest) => Promise<NextResponse>

/**
 * Options for credit middleware
 */
export interface CreditMiddlewareOptions {
  /** Credit cost for the operation (can be static or function) */
  creditCost: number | ((request: AuthenticatedRequest) => Promise<number>)

  /** Operation description for logging */
  operation?: string

  /** Whether to reserve credits before operation (default: true) */
  useReservation?: boolean
}

/**
 * Credits middleware for API routes
 * Checks balance, reserves credits, executes handler, confirms or cancels
 *
 * @example
 * ```typescript
 * export const POST = withAuth(
 *   withCredits(
 *     async (request) => {
 *       const { user, supabase, creditCost } = request
 *       // Your logic here - credits already reserved
 *       return NextResponse.json({ success: true })
 *     },
 *     { creditCost: 10, operation: 'generate-image' }
 *   )
 * )
 * ```
 */
export function withCredits(
  handler: CreditHandler,
  options: CreditMiddlewareOptions
) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    const repository = new SupabaseCreditsRepository(request.supabase)
    const operation = options.operation || 'unknown'
    const useReservation = options.useReservation ?? true

    try {
      // 1. Calculate credit cost
      const creditCost =
        typeof options.creditCost === 'function'
          ? await options.creditCost(request)
          : options.creditCost

      if (creditCost <= 0) {
        logger.error('[withCredits] Invalid credit cost', {
          userId: request.user.id,
          creditCost,
          operation,
        })
        return NextResponse.json(
          { error: 'Invalid credit cost configuration' },
          { status: 500 }
        )
      }

      // 2. Attach credit cost to request
      const creditRequest = request as CreditRequest
      creditRequest.creditCost = creditCost

      // 3. Reserve credits (if using reservation system)
      // ✅ No pre-check needed - SQL function is atomic and will fail if insufficient
      let reservationId: string | null = null

      if (useReservation) {
        try {
          reservationId = await repository.reserveCredits(
            request.user.id,
            creditCost,
            operation
          )

          logger.debug('[withCredits] Credits reserved', {
            userId: request.user.id,
            creditCost,
            reservationId,
            operation,
          })
        } catch (error: any) {
          // ✅ Parse SQL error message to extract balance info
          if (error.message.includes('Insufficient credits')) {
            const match = error.message.match(/Required: (\d+), Available: (\d+)/)
            const required = match ? parseInt(match[1]) : creditCost
            const available = match ? parseInt(match[2]) : 0

            logger.warn('[withCredits] Insufficient credits', {
              userId: request.user.id,
              balance: available,
              required,
              operation,
            })

            return NextResponse.json(
              {
                error: 'Insufficient credits',
                message: `You need ${required} credits but only have ${available}`,
                balance: available,
                required,
              },
              { status: 402 } // Payment Required
            )
          }

          // Other errors
          logger.error('[withCredits] Failed to reserve credits', {
            userId: request.user.id,
            creditCost,
            error: error.message,
            operation,
          })
          return NextResponse.json(
            { error: 'Failed to reserve credits' },
            { status: 500 }
          )
        }
      }

      // 5. Execute handler
      let response: NextResponse

      try {
        response = await handler(creditRequest)
      } catch (handlerError: any) {
        // Handler failed - cancel reservation
        if (reservationId) {
          try {
            await repository.cancelReservation(reservationId)
            logger.debug('[withCredits] Reservation cancelled after handler error', {
              userId: request.user.id,
              reservationId,
              operation,
            })
          } catch (cancelError) {
            logger.error('[withCredits] Failed to cancel reservation', {
              userId: request.user.id,
              reservationId,
              cancelError,
              operation,
            })
          }
        }

        throw handlerError
      }

      // 6. Confirm reservation or deduct credits directly
      const isSuccess = response.status >= 200 && response.status < 300

      if (isSuccess) {
        if (reservationId) {
          // Confirm reservation
          try {
            await repository.confirmReservation(
              reservationId,
              creditRequest.transactionMetadata
            )

            logger.info('[withCredits] Credits deducted successfully', {
              userId: request.user.id,
              creditCost,
              reservationId,
              operation,
            })
          } catch (confirmError) {
            logger.error('[withCredits] Failed to confirm reservation', {
              userId: request.user.id,
              reservationId,
              confirmError,
              operation,
            })

            // This is critical - operation succeeded but credit deduction failed
            // Cancel reservation to avoid charging later
            try {
              await repository.cancelReservation(reservationId)
            } catch (cancelError) {
              logger.error('[withCredits] Failed to cancel after confirm error', {
                userId: request.user.id,
                reservationId,
                cancelError,
                operation,
              })
            }

            return NextResponse.json(
              { error: 'Operation succeeded but credit deduction failed' },
              { status: 500 }
            )
          }
        } else {
          // No reservation - deduct directly
          try {
            await repository.consumeCredits(
              request.user.id,
              creditCost,
              operation,
              creditRequest.transactionMetadata
            )

            logger.info('[withCredits] Credits deducted directly', {
              userId: request.user.id,
              creditCost,
              operation,
            })
          } catch (deductError) {
            logger.error('[withCredits] Failed to deduct credits', {
              userId: request.user.id,
              creditCost,
              deductError,
              operation,
            })

            return NextResponse.json(
              { error: 'Operation succeeded but credit deduction failed' },
              { status: 500 }
            )
          }
        }
      } else {
        // Operation failed - cancel reservation
        if (reservationId) {
          try {
            await repository.cancelReservation(reservationId)
            logger.debug('[withCredits] Reservation cancelled after failed operation', {
              userId: request.user.id,
              reservationId,
              operation,
            })
          } catch (cancelError) {
            logger.error('[withCredits] Failed to cancel reservation after failed operation', {
              userId: request.user.id,
              reservationId,
              cancelError,
              operation,
            })
          }
        }
      }

      return response
    } catch (error: any) {
      logger.error('[withCredits] Unexpected error', {
        error: error.message,
        stack: error.stack,
        userId: request.user.id,
        operation,
      })

      return NextResponse.json(
        { error: 'Internal server error', message: 'An unexpected error occurred' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to calculate credit cost based on request body
 *
 * @example
 * ```typescript
 * withCredits(handler, {
 *   creditCost: calculateCreditCostFromBody({
 *     hd: 10,
 *     standard: 5,
 *   }),
 *   operation: 'generate-image'
 * })
 * ```
 */
export function calculateCreditCostFromBody(costs: {
  hd: number
  standard: number
}) {
  return async (request: AuthenticatedRequest): Promise<number> => {
    try {
      const body = await request.json()
      const quality = body.quality || 'standard'
      return quality === 'hd' ? costs.hd : costs.standard
    } catch {
      return costs.standard // Default to standard if parsing fails
    }
  }
}
