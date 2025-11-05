/**
 * Module Billing - Exports
 * Gestion des crédits, packs et paiements Stripe
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types'

// ============================================================================
// DOMAIN (Business Rules & Configuration)
// ============================================================================
export * from './domain/credit-rules'
export * from './domain/pricing.config'

// ============================================================================
// SERVICES (Use Cases)
// ============================================================================
export { ConsumeCreditsService } from './services/consume-credits'
export { AddCreditsService } from './services/add-credits'
export { GetBalanceService } from './services/get-balance'

// ============================================================================
// API (Repositories & Adapters)
// ============================================================================
// Credits Repository
export { SupabaseCreditsRepository } from './api/credits.repository'
export { SupabaseCreditsRepository as CreditsRepository } from './api/credits.repository' // Alias for backward compatibility

// Stripe - Server-only exports
// ⚠️ DO NOT export stripe instance or checkout here - they are server-only
// Import directly from './api/stripe' or './api/checkout' in API routes only
// handleWebhook est server-only - import directement depuis './api/webhooks' quand nécessaire

// ============================================================================
// UI (Components & Hooks)
// ============================================================================
// Hooks
export { useCreditBalance } from './ui/hooks/use-credit-balance'
export { useCreditPacks } from './ui/hooks/use-credit-packs'
export { usePurchaseCredits } from './ui/hooks/use-purchase-credits'

// Components
export { CreditPackCard } from './ui/components/credit-pack-card'
export { CreditsOverviewCard } from './ui/components/credits-overview-card'
export { UsageHistoryTable } from './ui/components/usage-history-table'
