/**
 * Service - Consume Credits
 * Déduction de crédits avec validation métier
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ConsumeCreditsInput } from '../types'
import { validateCreditConsumption, canConsumeCredits } from '../domain/credit-rules'

export class ConsumeCreditsService {
  constructor(private supabase: SupabaseClient) {}

  async execute(input: ConsumeCreditsInput): Promise<void> {
    const { userId, amount, reason, metadata } = input

    // 1. Validation métier
    const validation = validateCreditConsumption(amount)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // 2. Récupérer le solde actuel
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error(`Erreur lors de la récupération du solde: ${userError.message}`)
    }

    // 3. Vérifier le solde suffisant
    if (!canConsumeCredits(user.credits_balance, amount)) {
      throw new Error('Crédits insuffisants')
    }

    // 4. Déduire les crédits (transaction atomique via RPC)
    const { error: consumeError } = await this.supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_metadata: metadata || {},
    })

    if (consumeError) {
      throw new Error(`Erreur lors de la consommation des crédits: ${consumeError.message}`)
    }
  }
}
