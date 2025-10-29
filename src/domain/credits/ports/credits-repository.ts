/**
 * Port : Credits Repository
 * Interface abstraite pour accéder aux données de crédits
 * (sera implémentée par un adapter Supabase dans infra/)
 */

import type {
  CreditTransaction,
  CreditStats,
  CreateCreditTransactionInput,
} from '../models/credit-transaction'

export interface ICreditsRepository {
  /**
   * Récupérer toutes les transactions d'un utilisateur
   */
  getTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>

  /**
   * Récupérer les statistiques de crédits d'un utilisateur
   */
  getStats(userId: string): Promise<CreditStats>

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
