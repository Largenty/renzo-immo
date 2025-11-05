/**
 * Service - Add Credits
 * Ajout de crédits avec validation métier
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AddCreditsInput } from '../types'
import { validateCreditAddition } from '../domain/credit-rules'

export class AddCreditsService {
  constructor(private supabase: SupabaseClient) {}

  async execute(input: AddCreditsInput): Promise<void> {
    const { userId, amount, packId, reason, metadata } = input

    // 1. Validation métier
    const validation = validateCreditAddition(amount)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // 2. Ajouter les crédits (transaction atomique via RPC)
    const { error: addError } = await this.supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_pack_id: packId || null,
      p_reason: reason,
      p_metadata: metadata || {},
    })

    if (addError) {
      throw new Error(`Erreur lors de l'ajout des crédits: ${addError.message}`)
    }
  }
}
