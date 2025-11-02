/**
 * Domaine Credits - Point d'entrée
 * Export tous les éléments publics du domaine
 */

// Models
export * from './models/credit-transaction'
export * from './models/credit-pack'

// Business Rules
export * from './business-rules/calculate-credit-cost'
export * from './business-rules/validate-credit-balance'

// Ports
export type { ICreditsRepository, TransactionTypeFilter, PaginatedTransactions } from './ports/credits-repository'

// Services
export { ConsumeCreditsService } from './services/consume-credits'
export { AddCreditsService } from './services/add-credits'
export { GetCreditStatsService } from './services/get-credit-stats'

// Hooks (React)
export {
  useCreditStats,
  useCreditTransactions,
  useCreditTransactionsPaginated,
  useExportTransactions,
  useWeeklyStats,
  useCreditBalance,
  useConsumeCredits,
  useAddCredits,
} from './hooks/use-credits'

export { useCreditPacks } from './hooks/use-credit-packs'
