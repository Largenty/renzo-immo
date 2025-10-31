/**
 * Service : Ajouter des crédits
 * Cas d'usage pour ajouter des crédits (achat ou bonus)
 */

import type { ICreditsRepository } from '../ports/credits-repository'
import type { CreditTransaction, AddCreditsInput } from '../models/credit-transaction'
import { addCreditsInputSchema } from '../models/credit-transaction'

export class AddCreditsService {
  constructor(private readonly creditsRepository: ICreditsRepository) {}

  /**
   * Ajouter des crédits pour un utilisateur
   */
  async execute(userId: string, input: AddCreditsInput): Promise<CreditTransaction> {
    // 1. Valider l'input avec Zod
    const validatedInput = addCreditsInputSchema.parse(input)

    // 2. Créer la transaction (montant positif)
    const transaction = await this.creditsRepository.createTransaction(userId, {
      amount: validatedInput.amount,
      type: validatedInput.type,
      description: validatedInput.description,
      relatedInvoiceId: validatedInput.relatedInvoiceId,
    })

    return transaction
  }
}
