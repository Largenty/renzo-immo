/**
 * Service : Consommer des crédits
 * Cas d'usage pour utiliser des crédits (ex: pour une transformation d'image)
 */

import type { ICreditsRepository } from '../ports/credits-repository'
import type { CreditTransaction, ConsumeCreditsInput } from '../models/credit-transaction'
import { consumeCreditsInputSchema } from '../models/credit-transaction'
import {
  hasEnoughCredits,
  calculateMissingCredits,
  InsufficientCreditsError,
} from '../business-rules/validate-credit-balance'

export class ConsumeCreditsService {
  constructor(private readonly creditsRepository: ICreditsRepository) {}

  /**
   * Consommer des crédits pour un utilisateur
   * @throws {InsufficientCreditsError} Si l'utilisateur n'a pas assez de crédits
   */
  async execute(userId: string, input: ConsumeCreditsInput): Promise<CreditTransaction> {
    // 1. Valider l'input avec Zod
    const validatedInput = consumeCreditsInputSchema.parse(input)

    // 2. Vérifier le solde actuel
    const stats = await this.creditsRepository.getStats(userId)

    // 3. Vérifier si l'utilisateur a assez de crédits
    if (!hasEnoughCredits(stats, validatedInput.amount)) {
      const missing = calculateMissingCredits(stats, validatedInput.amount)
      throw new InsufficientCreditsError(validatedInput.amount, stats.totalRemaining, missing)
    }

    // 4. Créer la transaction (montant négatif pour usage)
    const transaction = await this.creditsRepository.createTransaction(userId, {
      amount: -Math.abs(validatedInput.amount), // Toujours négatif pour usage
      type: 'usage',
      description: validatedInput.description,
      relatedImageId: validatedInput.relatedImageId,
    })

    return transaction
  }
}
