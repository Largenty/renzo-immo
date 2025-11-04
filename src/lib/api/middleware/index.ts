/**
 * API Middlewares
 * Centralized middleware exports for API routes
 */

export {
  withAuth,
  composeMiddleware,
  type AuthenticatedRequest,
  type AuthenticatedHandler,
  type AuthMiddlewareOptions,
} from './auth'

export {
  withCredits,
  calculateCreditCostFromBody,
  type CreditRequest,
  type CreditHandler,
  type CreditMiddlewareOptions,
} from './credits'
