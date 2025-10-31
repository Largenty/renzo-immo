/**
 * Service : Récupérer les statistiques de crédits
 * Cas d'usage pour obtenir le solde et l'historique
 */

import type { ICreditsRepository } from '../ports/credits-repository'
import type { CreditStats, CreditTransaction } from '../models/credit-transaction'

export class GetCreditStatsService {
  constructor(private readonly creditsRepository: ICreditsRepository) {}

  /**
   * Récupérer les statistiques de crédits d'un utilisateur
   */
  async getStats(userId: string): Promise<CreditStats> {
    return this.creditsRepository.getStats(userId)
  }

  /**
   * Récupérer l'historique des transactions
   */
  async getTransactions(userId: string, limit?: number): Promise<CreditTransaction[]> {
    return this.creditsRepository.getTransactions(userId, limit)
  }

  /**
   * Récupérer le solde actuel
   */
  async getBalance(userId: string): Promise<number> {
    return this.creditsRepository.getBalance(userId)
  }
}
