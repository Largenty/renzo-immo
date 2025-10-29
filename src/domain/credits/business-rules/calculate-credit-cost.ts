/**
 * Règle métier : Calcul du coût en crédits
 * Définit combien de crédits coûte une transformation
 */

export const CREDIT_COSTS = {
  IMAGE_TRANSFORMATION: 1, // 1 crédit par transformation d'image
  BATCH_DISCOUNT_THRESHOLD: 10, // À partir de 10 images en batch
  BATCH_DISCOUNT_RATE: 0.1, // 10% de réduction
} as const

/**
 * Calcule le coût en crédits pour une transformation d'image
 */
export function calculateImageTransformationCost(imageCount: number = 1): number {
  const baseCost = imageCount * CREDIT_COSTS.IMAGE_TRANSFORMATION

  // Appliquer une réduction si batch > seuil
  if (imageCount >= CREDIT_COSTS.BATCH_DISCOUNT_THRESHOLD) {
    return Math.floor(baseCost * (1 - CREDIT_COSTS.BATCH_DISCOUNT_RATE))
  }

  return baseCost
}

/**
 * Vérifie si un nombre de crédits est valide
 */
export function isValidCreditAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0
}
