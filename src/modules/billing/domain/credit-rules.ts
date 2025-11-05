/**
 * Domain - Credit Rules
 * Règles métier pour la gestion des crédits
 */

import type { CreditCostType } from '../types'

/**
 * Coûts en crédits pour chaque opération
 */
export const CREDIT_COSTS = {
  IMAGE_GENERATION_SD: 1,
  IMAGE_GENERATION_HD: 2,
  IMAGE_RETRY: 1,
  BATCH_GENERATION: 5,
} as const

/**
 * Calcule le coût en crédits d'une opération
 */
export function calculateCreditCost(
  operation: CreditCostType,
  options?: { quantity?: number }
): number {
  const baseCost = CREDIT_COSTS[operation]
  const quantity = options?.quantity || 1
  return baseCost * quantity
}

/**
 * Vérifie si l'utilisateur a suffisamment de crédits
 */
export function canConsumeCredits(
  currentBalance: number,
  cost: number
): boolean {
  return currentBalance >= cost
}

/**
 * Valide une consommation de crédits
 */
export function validateCreditConsumption(amount: number): {
  valid: boolean
  error?: string
} {
  if (amount <= 0) {
    return {
      valid: false,
      error: 'Le montant doit être positif',
    }
  }

  if (!Number.isInteger(amount)) {
    return {
      valid: false,
      error: 'Le montant doit être un nombre entier',
    }
  }

  return { valid: true }
}

/**
 * Valide un ajout de crédits
 */
export function validateCreditAddition(amount: number): {
  valid: boolean
  error?: string
} {
  if (amount <= 0) {
    return {
      valid: false,
      error: 'Le montant doit être positif',
    }
  }

  if (!Number.isInteger(amount)) {
    return {
      valid: false,
      error: 'Le montant doit être un nombre entier',
    }
  }

  if (amount > 10000) {
    return {
      valid: false,
      error: 'Montant maximum dépassé (10000 crédits)',
    }
  }

  return { valid: true }
}
