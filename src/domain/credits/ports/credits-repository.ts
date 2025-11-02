/**
 * Port : Credits Repository
 * Interface abstraite pour accéder aux données de crédits
 * (sera implémentée par un adapter Supabase dans infra/)
 */

import type {
  CreditTransaction,
  CreditStats,
  WeeklyStats,
  CreateCreditTransactionInput,
} from '../models/credit-transaction'

/**
 * Type pour les filtres de transactions
 */
export type TransactionTypeFilter = 'all' | CreditTransaction['type']

/**
 * Résultat paginé de transactions
 */
export interface PaginatedTransactions {
  transactions: CreditTransaction[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ICreditsRepository {
  /**
   * Récupérer toutes les transactions d'un utilisateur
   */
  getTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>

  /**
   * Récupérer les transactions paginées avec filtres (optimisé pour la performance)
   */
  getTransactionsPaginated(
    userId: string,
    page: number,
    pageSize: number,
    searchQuery?: string,
    filterType?: TransactionTypeFilter
  ): Promise<PaginatedTransactions>

  /**
   * Récupérer les statistiques de crédits d'un utilisateur
   */
  getStats(userId: string): Promise<CreditStats>

  /**
   * Récupérer les statistiques hebdomadaires (optimisé pour la performance)
   */
  getWeeklyStats(userId: string): Promise<WeeklyStats>

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
