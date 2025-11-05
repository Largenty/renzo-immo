/**
 * Module Billing - Types
 * Gestion des crédits, packs et transactions
 */

export interface CreditPack {
  id: string
  name: string
  credits: number
  priceCents: number // Prix en centimes (ex: 999 = 9.99€)
  stripePriceId: string
  stripeProductId: string
  isActive: boolean
  displayOrder: number
  popular: boolean
  createdAt: string
  updatedAt: string
}

// DTO from database (snake_case)
export interface CreditPackDTO {
  id: string
  name: string
  credits: number
  price_cents: number
  stripe_price_id: string
  stripe_product_id: string
  is_active: boolean
  display_order: number
  popular: boolean
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number // Positif = ajout, négatif = consommation
  type: 'purchase' | 'consumption' | 'refund' | 'bonus'
  reason?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface CreditBalance {
  userId: string
  balance: number
  totalPurchased: number
  totalConsumed: number
  lastTransactionAt: Date | null
}

export type CreditCostType =
  | 'IMAGE_GENERATION_SD'
  | 'IMAGE_GENERATION_HD'
  | 'IMAGE_RETRY'
  | 'BATCH_GENERATION'

export interface ConsumeCreditsInput {
  userId: string
  amount: number
  reason: string
  metadata?: Record<string, any>
}

export interface AddCreditsInput {
  userId: string
  amount: number
  packId?: string
  reason: string
  metadata?: Record<string, any>
}

// Repository interfaces
export interface ICreditsRepository {
  getCreditBalance(userId: string): Promise<CreditBalance>
  getCreditPacks(): Promise<CreditPack[]>
  getCreditPackById(id: string): Promise<CreditPack | null>
  getTransactionHistory(userId: string, limit?: number): Promise<CreditTransaction[]>
  createTransaction(transaction: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction>
}

// ============================================
// MAPPERS
// ============================================

/**
 * Mapper : CreditPackDTO (database) → CreditPack (domain)
 */
export function fromCreditPackDTO(dto: CreditPackDTO): CreditPack {
  return {
    id: dto.id,
    name: dto.name,
    credits: dto.credits,
    priceCents: dto.price_cents,
    stripePriceId: dto.stripe_price_id,
    stripeProductId: dto.stripe_product_id,
    isActive: dto.is_active,
    displayOrder: dto.display_order,
    popular: dto.popular,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
