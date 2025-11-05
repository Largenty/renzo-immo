'use client'

import { useEffect } from 'react'
import { usePollingGenerationStatus } from '../hooks/use-images'
import { useQueryClient } from '@tanstack/react-query'

interface ImagePollingHandlerProps {
  imageId: string
  taskId: string | null | undefined
}

/**
 * Composant invisible qui gère le polling d'une seule image
 * Doit être rendu pour chaque image en cours de génération
 */
export function ImagePollingHandler({ imageId, taskId }: ImagePollingHandlerProps) {
  const queryClient = useQueryClient()

  // Activer le polling uniquement si on a un taskId
  const { data: status, error } = usePollingGenerationStatus(
    imageId,
    taskId || undefined,
    !!taskId
  )

  // Quand le statut change à 'completed' ou 'failed', invalider les queries
  useEffect(() => {
    if (status?.status === 'completed' || status?.status === 'failed') {
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })
      queryClient.invalidateQueries({ queryKey: ['images', 'project'] })
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
    }
  }, [status?.status, imageId, queryClient])

  // Composant invisible
  return null
}
