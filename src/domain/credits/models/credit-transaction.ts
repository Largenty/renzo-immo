/**
 * Modèle du domaine : Credit Transaction
 * Représente une transaction de crédit (achat, utilisation, bonus, remboursement)
 */

import { z } from 'zod'

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
