/**
 * React Hooks pour le domaine Credits
 * Expose les services du domaine via React Query
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SupabaseCreditsRepository } from '@/infra/adapters/credits-repository.supabase'
import { ConsumeCreditsService } from '../services/consume-credits'
import { AddCreditsService } from '../services/add-credits'
import { GetCreditStatsService } from '../services/get-credit-stats'
import type { ConsumeCreditsInput, AddCreditsInput } from '../models/credit-transaction'
import { InsufficientCreditsError } from '../business-rules/validate-credit-balance'

/**
 * Hook : Récupérer les statistiques de crédits
 */
export function useCreditStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['credit-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseCreditsRepository(supabase)
      const service = new GetCreditStatsService(repository)

      return service.getStats(userId)
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook : Récupérer l'historique des transactions
 */
export function useCreditTransactions(userId: string | undefined, limit: number = 50) {
  return useQuery({
    queryKey: ['credit-transactions', userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseCreditsRepository(supabase)
      const service = new GetCreditStatsService(repository)

      return service.getTransactions(userId, limit)
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook : Récupérer le solde de crédits
 */
export function useCreditBalance(userId: string | undefined) {
  return useQuery({
    queryKey: ['credit-balance', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseCreditsRepository(supabase)
      const service = new GetCreditStatsService(repository)

      return service.getBalance(userId)
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook : Consommer des crédits
 */
export function useConsumeCredits(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ConsumeCreditsInput) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseCreditsRepository(supabase)
      const service = new ConsumeCreditsService(repository)

      return service.execute(userId, input)
    },
    onSuccess: () => {
      // Invalider tous les caches liés aux crédits
      queryClient.invalidateQueries({ queryKey: ['credit-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['credit-transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['credit-balance', userId] })
    },
    onError: (error) => {
      if (error instanceof InsufficientCreditsError) {
        toast.error('Crédits insuffisants', {
          description: `Il vous manque ${error.missing} crédit(s). Vous avez ${error.available} crédit(s), mais ${error.required} sont requis.`,
        })
      } else {
        toast.error("Erreur lors de l'utilisation des crédits", {
          description: error instanceof Error ? error.message : 'Une erreur est survenue',
        })
      }
    },
  })
}

/**
 * Hook : Ajouter des crédits
 */
export function useAddCredits(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddCreditsInput) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseCreditsRepository(supabase)
      const service = new AddCreditsService(repository)

      return service.execute(userId, input)
    },
    onSuccess: (data) => {
      // Invalider tous les caches
      queryClient.invalidateQueries({ queryKey: ['credit-stats', userId] })
      queryClient.invalidateQueries({ queryKey: ['credit-transactions', userId] })
      queryClient.invalidateQueries({ queryKey: ['credit-balance', userId] })

      toast.success(`${data.amount} crédits ajoutés !`)
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de crédits", {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}
