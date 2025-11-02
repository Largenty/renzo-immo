/**
 * React Hook pour récupérer les packs de crédits
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CreditPack } from '../models/credit-pack'

/**
 * Hook : Récupérer les packs de crédits disponibles
 */
export function useCreditPacks() {
  return useQuery({
    queryKey: ['credit-packs'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('credit_packs')
        .select('*')
        .eq('is_active', true)
        .order('credits', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch credit packs: ${error.message}`)
      }

      // Mapper vers le format CreditPack
      return (data || []).map(
        (pack): CreditPack => ({
          id: pack.id,
          name: pack.name,
          credits: pack.credits,
          price: Number(pack.price),
          pricePerCredit: Number(pack.price_per_credit),
          popular: pack.is_popular || false,
        })
      )
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (packs changent rarement)
  })
}
