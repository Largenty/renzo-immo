/**
 * Domain - Pricing Configuration
 * Configuration des packs de crédits
 */

import type { CreditPack } from '../types'

/**
 * Packs de crédits disponibles
 * Note: Les IDs et stripePriceId doivent correspondre à ceux en base de données
 */
export const CREDIT_PACKS: Omit<CreditPack, 'id' | 'stripePriceId' | 'stripeProductId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Starter',
    credits: 50,
    priceCents: 999, // 9.99€
    isActive: true,
    displayOrder: 1,
    popular: false,
  },
  {
    name: 'Pro',
    credits: 200,
    priceCents: 2999, // 29.99€
    isActive: true,
    displayOrder: 2,
    popular: true,
  },
  {
    name: 'Business',
    credits: 500,
    priceCents: 5999, // 59.99€
    isActive: true,
    displayOrder: 3,
    popular: false,
  },
]

/**
 * Trouve un pack par son nombre de crédits
 */
export function findPackByCredits(credits: number) {
  return CREDIT_PACKS.find(pack => pack.credits === credits)
}

/**
 * Calcule le prix par crédit d'un pack
 */
export function calculatePricePerCredit(price: number, credits: number): number {
  return Number((price / credits).toFixed(2))
}

/**
 * Obtient le pack le plus populaire
 */
export function getPopularPack() {
  return CREDIT_PACKS.find(pack => pack.popular) || CREDIT_PACKS[0]
}
