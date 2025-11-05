/**
 * Modèle du domaine : Credit Pack
 * Représente un pack de crédits disponible à l'achat
 */

import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number; // Prix en centimes (ex: 999 = 9.99€)
  stripePriceId: string; // Stripe Price ID (price_xxx)
  stripeProductId: string; // Stripe Product ID (prod_xxx)
  isActive: boolean;
  displayOrder: number;
  popular: boolean; // Pack populaire/recommandé
  createdAt: string;
  updatedAt: string;
}

// DTO from database
export interface CreditPackDTO {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id: string;
  stripe_product_id: string;
  is_active: boolean;
  display_order: number;
  popular: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const creditPackSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  credits: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  stripePriceId: z.string().min(1),
  stripeProductId: z.string().min(1),
  isActive: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  popular: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreditPackInput = z.infer<typeof creditPackSchema>;

// ============================================
// MAPPERS
// ============================================

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
  };
}

// ============================================
// HELPERS
// ============================================

export function formatPrice(priceCents: number): string {
  return (priceCents / 100).toFixed(2) + '€';
}

export function getPricePerCredit(priceCents: number, credits: number): string {
  const pricePerCredit = priceCents / credits / 100;
  return pricePerCredit.toFixed(3) + '€';
}
/**
 * Modèle du domaine : Credit Transaction
 * Représente une transaction de crédit (achat, utilisation, bonus, remboursement)
 */

// ============================================
// TYPES
// ============================================

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus'

export interface CreditTransaction {
  id: string
  userId: string
  amount: number // Positif pour achat/bonus, négatif pour usage
  type: CreditTransactionType
  description: string
  imageCount?: number // Nombre d'images générées (pour type 'usage')
  imageQuality?: 'standard' | 'hd' // Qualité des images générées (pour type 'usage')
  relatedProjectName?: string // Nom du projet lié
  relatedImageId?: string
  relatedInvoiceId?: string
  createdAt: Date
}

export interface CreditStats {
  totalPurchased: number
  totalUsed: number
  totalRemaining: number
  transactionsCount: number
}

export interface WeeklyStats {
  thisWeekCredits: number
  lastWeekCredits: number
  percentageChange: number
  hdImagesCount: number
  totalCreditsUsed: number
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const creditTransactionTypeSchema = z.enum(['purchase', 'usage', 'refund', 'bonus'])

export const creditTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int(),
  type: creditTransactionTypeSchema,
  description: z.string().min(1).max(500),
  relatedImageId: z.string().uuid().optional(),
  relatedInvoiceId: z.string().uuid().optional(),
  createdAt: z.date(),
})

export const creditStatsSchema = z.object({
  totalPurchased: z.number().int().nonnegative(),
  totalUsed: z.number().int().nonnegative(),
  totalRemaining: z.number().int(),
  transactionsCount: z.number().int().nonnegative(),
})

// ============================================
// SCHÉMAS D'ENTRÉE (pour créer des transactions)
// ============================================

export const createCreditTransactionInputSchema = z.object({
  amount: z.number().int().positive('Le montant doit être positif'),
  type: creditTransactionTypeSchema,
  description: z.string().min(1, 'La description est requise').max(500),
  relatedImageId: z.string().uuid().optional(),
  relatedInvoiceId: z.string().uuid().optional(),
})

export const consumeCreditsInputSchema = z.object({
  amount: z.number().int().positive('Le montant doit être positif'),
  description: z.string().min(1, 'La description est requise').max(500),
  relatedImageId: z.string().uuid().optional(),
})

export const addCreditsInputSchema = z.object({
  amount: z.number().int().positive('Le montant doit être positif'),
  type: z.enum(['purchase', 'bonus']).default('purchase'),
  description: z.string().min(1, 'La description est requise').max(500),
  relatedInvoiceId: z.string().uuid().optional(),
})

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreateCreditTransactionInput = z.infer<typeof createCreditTransactionInputSchema>
export type ConsumeCreditsInput = z.infer<typeof consumeCreditsInputSchema>
export type AddCreditsInput = z.infer<typeof addCreditsInputSchema>
/**
 * Port : Credits Repository
 * Interface abstraite pour accéder aux données de crédits
 * (sera implémentée par un adapter Supabase dans infra/)
 */


/**
 * Type pour les filtres de transactions
 */
export type TransactionTypeFilter = 'all' | CreditTransaction['type']

/**
 * Résultat paginé de transactions
 */
export interface PaginatedTransactions {
  transactions: CreditTransaction[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ICreditsRepository {
  /**
   * Récupérer toutes les transactions d'un utilisateur
   */
  getTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>

  /**
   * Récupérer les transactions paginées avec filtres (optimisé pour la performance)
   */
  getTransactionsPaginated(
    userId: string,
    page: number,
    pageSize: number,
    searchQuery?: string,
    filterType?: TransactionTypeFilter
  ): Promise<PaginatedTransactions>

  /**
   * Récupérer les statistiques de crédits d'un utilisateur
   */
  getStats(userId: string): Promise<CreditStats>

  /**
   * Récupérer les statistiques hebdomadaires (optimisé pour la performance)
   */
  getWeeklyStats(userId: string): Promise<WeeklyStats>

  /**
   * Créer une nouvelle transaction de crédit
   */
  createTransaction(
    userId: string,
    input: CreateCreditTransactionInput
  ): Promise<CreditTransaction>

  /**
   * Récupérer une transaction par ID
   */
  getTransactionById(transactionId: string): Promise<CreditTransaction | null>

  /**
   * Récupérer le solde actuel de crédits
   */
  getBalance(userId: string): Promise<number>
}

// Types merged from domain/credits/models and ports
