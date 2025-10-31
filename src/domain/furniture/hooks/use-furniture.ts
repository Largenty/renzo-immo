/**
 * Hooks React Query pour la gestion des meubles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  FurnitureItem,
  CreateFurnitureInput,
  UpdateFurnitureInput,
} from '../models/furniture'
import { logger } from '@/lib/logger'

// ============================================
// QUERY: Liste des meubles
// ============================================

export function useFurnitureList() {
  return useQuery({
    queryKey: ['furniture', 'list'],
    queryFn: async (): Promise<FurnitureItem[]> => {
      const response = await fetch('/api/furniture')
      if (!response.ok) {
        throw new Error('Failed to fetch furniture list')
      }
      const data = await response.json()
      return data.furniture || []
    },
  })
}

// ============================================
// QUERY: Un meuble par ID
// ============================================

export function useFurniture(furnitureId: string | undefined) {
  return useQuery({
    queryKey: ['furniture', furnitureId],
    queryFn: async (): Promise<FurnitureItem> => {
      if (!furnitureId) throw new Error('Furniture ID required')

      const response = await fetch(`/api/furniture/${furnitureId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch furniture')
      }
      const data = await response.json()
      return data.furniture
    },
    enabled: !!furnitureId,
  })
}

// ============================================
// MUTATION: Créer un meuble
// ============================================

export function useCreateFurniture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFurnitureInput): Promise<FurnitureItem> => {
      logger.debug('[useCreateFurniture] Creating furniture', input)

      const response = await fetch('/api/furniture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create furniture')
      }

      const data = await response.json()
      return data.furniture
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['furniture', 'list'] })
    },
  })
}

// ============================================
// MUTATION: Mettre à jour un meuble
// ============================================

export function useUpdateFurniture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      furnitureId,
      input,
    }: {
      furnitureId: string
      input: UpdateFurnitureInput
    }): Promise<FurnitureItem> => {
      logger.debug('[useUpdateFurniture] Updating furniture', { furnitureId, input })

      const response = await fetch(`/api/furniture/${furnitureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update furniture')
      }

      const data = await response.json()
      return data.furniture
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['furniture', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['furniture', variables.furnitureId] })
    },
  })
}

// ============================================
// MUTATION: Supprimer un meuble
// ============================================

export function useDeleteFurniture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (furnitureId: string): Promise<void> => {
      logger.debug('[useDeleteFurniture] Deleting furniture', { furnitureId })

      const response = await fetch(`/api/furniture/${furnitureId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete furniture')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['furniture', 'list'] })
    },
  })
}
