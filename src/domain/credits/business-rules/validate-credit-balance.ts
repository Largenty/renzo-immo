/**
 * Règle métier : Validation du solde de crédits
 * Vérifie si un utilisateur a assez de crédits
 */

import type { CreditStats } from '../models/credit-transaction'

/**
 * Vérifie si l'utilisateur a suffisamment de crédits
 */
export function hasEnoughCredits(stats: CreditStats, requiredAmount: number): boolean {
  return stats.totalRemaining >= requiredAmount
}

/**
 * Calcule le nombre de crédits manquants
 */
export function calculateMissingCredits(stats: CreditStats, requiredAmount: number): number {
  const missing = requiredAmount - stats.totalRemaining
  return missing > 0 ? missing : 0
}

/**
 * Vérifie si le solde de crédits est bas (< 10)
 */
export function isLowCreditBalance(stats: CreditStats): boolean {
  return stats.totalRemaining < 10
}

/**
 * Erreur métier : Crédits insuffisants
 */
export class InsufficientCreditsError extends Error {
  constructor(
    public readonly required: number,
    public readonly available: number,
    public readonly missing: number
  ) {
    super(
      `Crédits insuffisants. Requis: ${required}, Disponible: ${available}, Manquant: ${missing}`
    )
    this.name = 'InsufficientCreditsError'
  }
}
