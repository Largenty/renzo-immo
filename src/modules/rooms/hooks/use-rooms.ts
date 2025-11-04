/**
 * Hooks React Query pour la gestion des pièces
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  RoomSpecification,
  CreateRoomInput,
  UpdateRoomInput,
} from '../models/room'
import { logger } from '@/lib/logger'

// ============================================
// QUERY: Liste des pièces
// ============================================

export function useRoomsList() {
  return useQuery({
    queryKey: ['rooms', 'list'],
    queryFn: async (): Promise<RoomSpecification[]> => {
      const response = await fetch('/api/rooms')
      if (!response.ok) {
        throw new Error('Failed to fetch rooms list')
      }
      const data = await response.json()
      return data.rooms || []
    },
  })
}

// ============================================
// QUERY: Une pièce par ID
// ============================================

export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: async (): Promise<RoomSpecification> => {
      if (!roomId) throw new Error('Room ID required')

      const response = await fetch(`/api/rooms/${roomId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch room')
      }
      const data = await response.json()
      return data.room
    },
    enabled: !!roomId,
  })
}

// ============================================
// MUTATION: Créer une pièce
// ============================================

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRoomInput): Promise<RoomSpecification> => {
      logger.debug('[useCreateRoom] Creating room', input)

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create room')
      }

      const data = await response.json()
      return data.room
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] })
    },
  })
}

// ============================================
// MUTATION: Mettre à jour une pièce
// ============================================

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      input,
    }: {
      roomId: string
      input: UpdateRoomInput
    }): Promise<RoomSpecification> => {
      logger.debug('[useUpdateRoom] Updating room', { roomId, input })

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update room')
      }

      const data = await response.json()
      return data.room
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.roomId] })
    },
  })
}

// ============================================
// MUTATION: Supprimer une pièce
// ============================================

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string): Promise<void> => {
      logger.debug('[useDeleteRoom] Deleting room', { roomId })

      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete room')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] })
    },
  })
}
