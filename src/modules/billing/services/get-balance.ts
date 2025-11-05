/**
 * Service - Get Balance
 * Récupération du solde de crédits
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreditBalance } from '../types'

export class GetBalanceService {
  constructor(private supabase: SupabaseClient) {}

  async execute(userId: string): Promise<CreditBalance> {
    const { data, error } = await this.supabase
      .from('users')
      .select('credits_balance, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`Erreur lors de la récupération du solde: ${error.message}`)
    }

    // Récupérer les stats depuis credit_transactions
    const { data: stats } = await this.supabase.rpc('get_credit_stats', {
      p_user_id: userId,
    })

    return {
      userId,
      balance: data.credits_balance || 0,
      totalPurchased: stats?.total_purchased || 0,
      totalConsumed: stats?.total_consumed || 0,
      lastTransactionAt: stats?.last_transaction_at ? new Date(stats.last_transaction_at) : null,
    }
  }
}
