/**
 * Domaine Credits - Point d'entrée
 * Export tous les éléments publics du domaine
 */

// Models
export * from './models/credit-transaction'

// Business Rules
export * from './business-rules/calculate-credit-cost'
export * from './business-rules/validate-credit-balance'

// Ports
export type { ICreditsRepository } from './ports/credits-repository'

// Services
export { ConsumeCreditsService } from './services/consume-credits'
export { AddCreditsService } from './services/add-credits'
export { GetCreditStatsService } from './services/get-credit-stats'

// Hooks (React)
export {
  useCreditStats,
  useCreditTransactions,
  useCreditBalance,
  useConsumeCredits,
  useAddCredits,
} from './hooks/use-credits'
