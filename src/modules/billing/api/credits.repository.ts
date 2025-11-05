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
  ICreditsRepository,
  PaginatedTransactions,
  TransactionTypeFilter,
} from '@/modules/credits'

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

  /**
   * Consume credits for an operation
   * Uses atomic SQL function to prevent race conditions
   */
  async consumeCredits(
    userId: string,
    amount: number,
    operation: string,
    metadata?: {
      imageQuality?: 'standard' | 'hd'
      imageCount?: number
      relatedProjectId?: string
      relatedProjectName?: string
      relatedImageId?: string
    }
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reference_type: 'image',
      p_reference_id: metadata?.relatedImageId || null,
      p_description: `${operation} - ${metadata?.imageQuality || 'standard'} quality`,
    })

    if (error) {
      throw new Error(`Failed to consume credits: ${error.message}`)
    }

    return data // Returns transaction ID
  }

  /**
   * Reserve credits for an operation (pending state)
   * ✅ ATOMIC: Deducts credits immediately using SQL function
   * This prevents race conditions where multiple requests could exceed the balance
   */
  async reserveCredits(
    userId: string,
    amount: number,
    operation: string
  ): Promise<string> {
    // ✅ Use atomic SQL function to deduct immediately
    // This ensures no race conditions - if balance insufficient, SQL function will fail
    const { data, error } = await this.supabase.rpc('deduct_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reference_type: 'reservation',
      p_reference_id: null,
      p_description: `[PENDING] ${operation}`,
    })

    if (error) {
      // SQL function throws error if insufficient credits
      throw new Error(`Failed to reserve credits: ${error.message}`)
    }

    // Returns transaction ID
    return data
  }

  /**
   * Confirm a credit reservation
   * ✅ NO DOUBLE DEDUCTION: Just updates transaction metadata from PENDING to CONFIRMED
   * Credits were already deducted in reserveCredits()
   */
  async confirmReservation(
    reservationId: string,
    metadata?: {
      imageQuality?: 'standard' | 'hd'
      imageCount?: number
      relatedProjectId?: string
      relatedProjectName?: string
      relatedImageId?: string
    }
  ): Promise<void> {
    // Get the pending transaction to update it
    const { data: reservation, error: fetchError } = await this.supabase
      .from('credit_transactions')
      .select('description, metadata')
      .eq('id', reservationId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Reservation not found or already confirmed/cancelled
        return
      }
      throw new Error(`Failed to fetch reservation: ${fetchError.message}`)
    }

    // ✅ Update transaction: PENDING → CONFIRMED with metadata
    const { error: updateError } = await this.supabase
      .from('credit_transactions')
      .update({
        description: reservation.description.replace('[PENDING] ', ''),
        image_quality: metadata?.imageQuality || null,
        image_count: metadata?.imageCount || null,
        related_project_name: metadata?.relatedProjectName || null,
        related_image_id: metadata?.relatedImageId || null,
        metadata: {
          ...reservation.metadata,
          status: 'confirmed',
        }
      })
      .eq('id', reservationId)

    if (updateError) {
      throw new Error(`Failed to confirm reservation: ${updateError.message}`)
    }
  }

  /**
   * Cancel a credit reservation
   * ✅ REFUNDS CREDITS: Since reserveCredits() deducts immediately, we must refund on cancel
   */
  async cancelReservation(reservationId: string): Promise<void> {
    // 1. Get the pending transaction to know how much to refund
    const { data: reservation, error: fetchError } = await this.supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Reservation not found - already cancelled or confirmed
        return
      }
      throw new Error(`Failed to fetch reservation: ${fetchError.message}`)
    }

    // Only cancel if still pending
    if (reservation.metadata?.status !== 'pending') {
      return
    }

    // 2. ✅ Refund the credits using SQL function
    const amount = Math.abs(reservation.amount)
    const { error: refundError } = await this.supabase.rpc('add_user_credits', {
      p_user_id: reservation.user_id,
      p_amount: amount,
      p_transaction_type: 'refund',
      p_description: `Refund: ${reservation.description}`,
      p_credit_pack_id: null,
      p_stripe_payment_intent_id: null,
      p_stripe_checkout_session_id: null,
      p_reference_type: 'refund',
      p_reference_id: reservationId,
    })

    if (refundError) {
      throw new Error(`Failed to refund credits: ${refundError.message}`)
    }

    // 3. Delete the pending transaction
    const { error: deleteError } = await this.supabase
      .from('credit_transactions')
      .delete()
      .eq('id', reservationId)

    if (deleteError) {
      throw new Error(`Failed to delete reservation: ${deleteError.message}`)
    }
  }
}
