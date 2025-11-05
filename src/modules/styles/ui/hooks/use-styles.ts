/**
 * React Hooks pour le domaine Styles
 * Expose les services du domaine via React Query
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SupabaseStylesRepository } from '@/modules/styles'
import { ManageCustomStylesService } from '@/modules/styles'
import { GetTransformationTypesService } from '@/modules/styles'
import type { CreateCustomStyleInput, UpdateCustomStyleInput } from '@/modules/styles'

/**
 * Hook : Récupérer tous les styles personnalisés de l'utilisateur
 */
export function useCustomStyles(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['custom-styles', userId],
    queryFn: async () => {
      if (!userId) return []

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new ManageCustomStylesService(repository)

      return service.getCustomStyles(userId)
    },
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook : Récupérer un style personnalisé par ID
 */
export function useCustomStyle(
  userId: string | undefined,
  styleId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['custom-styles', userId, styleId],
    queryFn: async () => {
      if (!userId || !styleId) return null

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new ManageCustomStylesService(repository)

      return service.getCustomStyleById(userId, styleId)
    },
    enabled: !!userId && !!styleId && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

/**
 * Hook : Récupérer tous les types de transformation (système + custom)
 */
export function useAllTransformationTypes(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['transformation-types', userId],
    queryFn: async () => {
      if (!userId) return []

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new GetTransformationTypesService(repository)

      return service.getAllTransformationTypes(userId)
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook : Créer un style personnalisé
 */
export function useCreateCustomStyle(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCustomStyleInput) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new ManageCustomStylesService(repository)

      return service.createCustomStyle(userId, input)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-styles', userId] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types', userId] })

      toast.success('Style créé avec succès', {
        description: `Le style "${data.name}" a été créé`,
      })
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du style', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Mettre à jour un style personnalisé
 */
export function useUpdateCustomStyle(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ styleId, ...input }: UpdateCustomStyleInput & { styleId: string }) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new ManageCustomStylesService(repository)

      return service.updateCustomStyle(userId, styleId, input)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-styles', userId] })
      queryClient.invalidateQueries({ queryKey: ['custom-styles', userId, data.id] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types', userId] })

      toast.success('Style mis à jour', {
        description: `Le style "${data.name}" a été mis à jour`,
      })
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour du style', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Supprimer un style personnalisé
 */
export function useDeleteCustomStyle(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (styleId: string) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseStylesRepository(supabase)
      const service = new ManageCustomStylesService(repository)

      await service.deleteCustomStyle(userId, styleId)
      return styleId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-styles', userId] })
      queryClient.invalidateQueries({ queryKey: ['transformation-types', userId] })

      toast.success('Style supprimé', {
        description: 'Le style personnalisé a été supprimé',
      })
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression du style', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}
