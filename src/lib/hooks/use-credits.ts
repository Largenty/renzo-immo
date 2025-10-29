/**
 * React Query hooks pour les crédits
 * Gère l'historique et les transactions de crédits
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth-store'

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  related_image_id?: string
  related_invoice_id?: string
  created_at: string
}

export interface CreditStats {
  total_purchased: number
  total_used: number
  total_remaining: number
  transactions_count: number
}

/**
 * Récupérer l'historique des transactions de crédits
 */
export function useCreditTransactions(limit = 50) {
  return useQuery({
    queryKey: ['credit-transactions', limit],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as CreditTransaction[]
    },
    staleTime: 30 * 1000, // 30 seconds - credits change frequently
  })
}

/**
 * Récupérer les statistiques de crédits
 */
export function useCreditStats() {
  return useQuery({
    queryKey: ['credit-stats'],
    queryFn: async () => {
      const supabase = createClient()

      // Récupérer toutes les transactions pour calculer les stats
      const { data: transactions, error } = await supabase
        .from('credit_transactions')
        .select('amount, type')

      if (error) throw error

      const stats: CreditStats = {
        total_purchased: 0,
        total_used: 0,
        total_remaining: 0,
        transactions_count: transactions?.length || 0,
      }

      transactions?.forEach((tx) => {
        if (tx.type === 'purchase' || tx.type === 'bonus') {
          stats.total_purchased += tx.amount
        } else if (tx.type === 'usage') {
          stats.total_used += Math.abs(tx.amount)
        }
      })

      stats.total_remaining = stats.total_purchased - stats.total_used

      return stats
    },
    staleTime: 1 * 60 * 1000, // 1 minute - credit stats update regularly
  })
}

/**
 * Utiliser des crédits (pour une transformation)
 */
export function useConsumeCredits() {
  const queryClient = useQueryClient()
  const updateCredits = useAuthStore((state) => state.updateCredits)

  return useMutation({
    mutationFn: async ({
      amount,
      description,
      relatedImageId,
    }: {
      amount: number
      description: string
      relatedImageId?: string
    }) => {
      const supabase = createClient()

      // Créer une transaction de type "usage"
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          amount: -Math.abs(amount), // Négatif pour usage
          type: 'usage',
          description,
          related_image_id: relatedImageId,
        })
        .select()
        .single()

      if (error) throw error

      return data as CreditTransaction
    },
    onSuccess: (data) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['credit-stats'] })

      // Mettre à jour le solde dans le store auth
      updateCredits(data.amount)
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'utilisation des crédits', {
        description: error.message,
      })
    },
  })
}

/**
 * Ajouter des crédits (achat ou bonus)
 */
export function useAddCredits() {
  const queryClient = useQueryClient()
  const updateCredits = useAuthStore((state) => state.updateCredits)

  return useMutation({
    mutationFn: async ({
      amount,
      type = 'purchase',
      description,
    }: {
      amount: number
      type?: 'purchase' | 'bonus'
      description: string
    }) => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          amount,
          type,
          description,
        })
        .select()
        .single()

      if (error) throw error

      return data as CreditTransaction
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['credit-stats'] })

      // Mettre à jour le store
      updateCredits(data.amount)

      toast.success(`${data.amount} crédits ajoutés !`)
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'ajout de crédits', {
        description: error.message,
      })
    },
  })
}
