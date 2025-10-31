/**
 * Hook personnalisé pour le polling automatique des images en cours de génération
 * Vérifie régulièrement le statut auprès de l'API NanoBanana
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Image } from '../models/image'
import { logger } from '@/lib/logger';

interface UseImagePollingOptions {
  images: Image[]
  projectId: string
  enabled?: boolean
  interval?: number // en millisecondes
}

export function useImagePolling({
  images,
  projectId,
  enabled = true,
  interval = 5000, // 5 secondes par défaut
}: UseImagePollingOptions) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Trouver toutes les images en cours de traitement avec un taskId
    const processingImages = images.filter(
      (img) => img.status === 'processing' && img.metadata?.nanobanana_task_id
    )

    if (processingImages.length === 0) {
      // Pas d'images à poller, arrêter l'intervalle
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    logger.debug(
      `🔄 Starting polling for ${processingImages.length} image(s) in project ${projectId}`
    )

    // Fonction pour vérifier le statut d'une image
    const checkImageStatus = async (image: Image) => {
      const taskId = image.metadata?.nanobanana_task_id

      if (!taskId) {
        logger.warn(`⚠️ No taskId found for image ${image.id}`)
        return
      }

      try {
        logger.debug(`🔍 Checking status for image ${image.id} (task: ${taskId})`)

        const response = await fetch('/api/check-generation-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: image.id,
            taskId,
          }),
        })

        if (!response.ok) {
          logger.error(`❌ Failed to check status for image ${image.id}:`, response.statusText)
          return
        }

        const result = await response.json()

        logger.debug(`📊 Status for image ${image.id}:`, result.status)

        // Si l'image est maintenant completed ou failed, invalider les queries pour rafraîchir l'UI
        if (result.status === 'completed' || result.status === 'failed') {
          logger.debug(`✅ Image ${image.id} finished with status: ${result.status}`)

          // Invalider les queries pour forcer un refetch
          // IMPORTANT: Utiliser la même query key que dans useProjectImages
          await queryClient.invalidateQueries({
            queryKey: ['images', 'project', projectId],
          })
        }
      } catch (error) {
        logger.error(`❌ Error checking status for image ${image.id}:`, error)
      }
    }

    // Démarrer le polling
    const pollAllImages = async () => {
      await Promise.all(processingImages.map(checkImageStatus))
    }

    // Vérifier immédiatement au montage
    pollAllImages()

    // Puis toutes les X secondes
    intervalRef.current = setInterval(pollAllImages, interval)

    // Cleanup à la fin
    return () => {
      if (intervalRef.current) {
        logger.debug(`⏹️ Stopping polling for project ${projectId}`)
        clearInterval(intervalRef.current)
      }
    }
  }, [images, projectId, enabled, interval, queryClient])

  // Retourner le nombre d'images en cours de polling
  const pollingCount = images.filter(
    (img) => img.status === 'processing' && img.metadata?.nanobanana_task_id
  ).length

  return {
    pollingCount,
    isPolling: pollingCount > 0,
  }
}
