/**
 * Adapter : Credits Repository Supabase
 * Implémentation concrète du port ICreditsRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CreditTransaction,
  CreditStats,
  CreateCreditTransactionInput,
} from '@/domain/credits/models/credit-transaction'
import type { ICreditsRepository } from '@/domain/credits/ports/credits-repository'

/**
 * Type de la table Supabase credit_transactions
 */
interface CreditTransactionRow {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  related_image_id: string | null
  related_invoice_id: string | null
  created_at: string
}

/**
 * Mapper : Row DB → Domain Model
 */
function mapRowToDomain(row: CreditTransactionRow): CreditTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    relatedImageId: row.related_image_id ?? undefined,
    relatedInvoiceId: row.related_invoice_id ?? undefined,
    createdAt: new Date(row.created_at),
  }
}

/**
 * Adapter Supabase pour le repository de crédits
 */
export class SupabaseCreditsRepository implements ICreditsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getTransactions(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch credit transactions: ${error.message}`)
    }

    return (data as CreditTransactionRow[]).map(mapRowToDomain)
  }

  async getStats(userId: string): Promise<CreditStats> {
    // Récupérer toutes les transactions pour calculer les stats
    const { data: transactions, error } = await this.supabase
      .from('credit_transactions')
      .select('amount, type')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch credit stats: ${error.message}`)
    }

    // Calculer les statistiques
    const stats: CreditStats = {
      totalPurchased: 0,
      totalUsed: 0,
      totalRemaining: 0,
      transactionsCount: transactions?.length || 0,
    }

    transactions?.forEach((tx) => {
      if (tx.type === 'purchase' || tx.type === 'bonus') {
        stats.totalPurchased += tx.amount
      } else if (tx.type === 'usage') {
        stats.totalUsed += Math.abs(tx.amount)
      }
    })

    stats.totalRemaining = stats.totalPurchased - stats.totalUsed

    return stats
  }

  async createTransaction(
    userId: string,
    input: CreateCreditTransactionInput
  ): Promise<CreditTransaction> {
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: input.amount,
        type: input.type,
        description: input.description,
        related_image_id: input.relatedImageId ?? null,
        related_invoice_id: input.relatedInvoiceId ?? null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create credit transaction: ${error.message}`)
    }

    return mapRowToDomain(data as CreditTransactionRow)
  }

  async getTransactionById(transactionId: string): Promise<CreditTransaction | null> {
    const { data, error } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch credit transaction: ${error.message}`)
    }

    return mapRowToDomain(data as CreditTransactionRow)
  }

  async getBalance(userId: string): Promise<number> {
    const stats = await this.getStats(userId)
    return stats.totalRemaining
  }
}
