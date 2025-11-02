/**
 * Modèle du domaine : Credit Pack
 * Représente un pack de crédits disponible à l'achat
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

export interface CreditPack {
  id: string
  name: string
  credits: number
  price: number // Prix en euros
  pricePerCredit: number // Prix par crédit (pour comparaison)
  popular: boolean // Pack populaire/recommandé
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const creditPackSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  credits: z.number().int().positive(),
  price: z.number().positive(),
  pricePerCredit: z.number().positive(),
  popular: z.boolean(),
})

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreditPackInput = z.infer<typeof creditPackSchema>
