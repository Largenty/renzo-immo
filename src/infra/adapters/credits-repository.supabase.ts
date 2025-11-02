/**
 * Adapter : Credits Repository Supabase
 * Implémentation concrète du port ICreditsRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CreditTransaction,
  CreditStats,
  WeeklyStats,
  CreateCreditTransactionInput,
} from '@/domain/credits/models/credit-transaction'
import type {
  ICreditsRepository,
  PaginatedTransactions,
  TransactionTypeFilter,
} from '@/domain/credits/ports/credits-repository'

/**
 * Type de la table Supabase credit_transactions
 */
interface CreditTransactionRow {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  image_count: number | null
  image_quality: 'standard' | 'hd' | null
  related_project_name: string | null
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
    imageCount: row.image_count ?? undefined,
    imageQuality: row.image_quality ?? undefined,
    relatedProjectName: row.related_project_name ?? undefined,
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

  async getTransactionsPaginated(
    userId: string,
    page: number,
    pageSize: number,
    searchQuery?: string,
    filterType?: TransactionTypeFilter
  ): Promise<PaginatedTransactions> {
    // Construire la requête de base
    let query = this.supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Appliquer le filtre de recherche (description)
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('description', `%${searchQuery.trim()}%`)
    }

    // Appliquer le filtre de type
    if (filterType && filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    // Calculer les indices de pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Exécuter la requête avec pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw new Error(`Failed to fetch paginated transactions: ${error.message}`)
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return {
      transactions: (data as CreditTransactionRow[]).map(mapRowToDomain),
      totalCount,
      page,
      pageSize,
      totalPages,
    }
  }

  async getStats(userId: string): Promise<CreditStats> {
    // ✅ Utilisation de la fonction SQL optimisée (agrégation côté DB)
    // Performance: 10 000 transactions → 1 requête en ~10ms
    const { data, error } = await this.supabase.rpc('get_credit_stats', {
      p_user_id: userId,
    })

    if (error) {
      throw new Error(`Failed to fetch credit stats: ${error.message}`)
    }

    // La fonction SQL retourne un tableau avec un seul élément
    const result = Array.isArray(data) ? data[0] : data

    if (!result) {
      // Aucune transaction trouvée
      return {
        totalPurchased: 0,
        totalUsed: 0,
        totalRemaining: 0,
        transactionsCount: 0,
      }
    }

    return {
      totalPurchased: result.total_purchased || 0,
      totalUsed: result.total_used || 0,
      totalRemaining: result.total_remaining || 0,
      transactionsCount: result.transactions_count || 0,
    }
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

  async getWeeklyStats(userId: string): Promise<WeeklyStats> {
    // ✅ Utilisation de la fonction SQL optimisée (agrégation côté DB)
    // Performance: Calculs SQL au lieu de charger 100 transactions en JS
    const { data, error } = await this.supabase.rpc('get_weekly_stats', {
      p_user_id: userId,
    })

    if (error) {
      throw new Error(`Failed to fetch weekly stats: ${error.message}`)
    }

    // La fonction SQL retourne un tableau avec un seul élément
    const result = Array.isArray(data) ? data[0] : data

    if (!result) {
      // Aucune transaction trouvée
      return {
        thisWeekCredits: 0,
        lastWeekCredits: 0,
        percentageChange: 0,
        hdImagesCount: 0,
        totalCreditsUsed: 0,
      }
    }

    return {
      thisWeekCredits: result.this_week_credits || 0,
      lastWeekCredits: result.last_week_credits || 0,
      percentageChange: result.percentage_change || 0,
      hdImagesCount: result.hd_images_count || 0,
      totalCreditsUsed: result.total_credits_used || 0,
    }
  }
}
