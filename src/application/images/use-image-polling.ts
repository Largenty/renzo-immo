/**
 * Hook personnalisé pour le polling automatique des images en cours de génération
 * Vérifie régulièrement le statut auprès de l'API NanoBanana
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Image } from '@/domain/images/models/image'
import { logger } from '@/lib/logger';

// 🔧 FIX: Maximum polling duration to prevent infinite loops
const MAX_POLL_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_POLL_ATTEMPTS_PER_IMAGE = 180; // 180 attempts * 5s = 15 minutes

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
  const pollStartTimeRef = useRef<number>(Date.now())
  const pollAttemptsRef = useRef<Map<string, number>>(new Map())

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
      // Reset poll tracking
      pollStartTimeRef.current = Date.now()
      pollAttemptsRef.current.clear()
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

      // 🔧 FIX: Check if polling has exceeded maximum attempts for this image
      const currentAttempts = pollAttemptsRef.current.get(image.id) || 0;
      if (currentAttempts >= MAX_POLL_ATTEMPTS_PER_IMAGE) {
        logger.warn(`⏱️ Max polling attempts reached for image ${image.id}. Stopping poll for this image.`);
        // Mark image as failed due to timeout
        try {
          await fetch('/api/images/timeout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId: image.id }),
          });
        } catch (error) {
          logger.error(`Failed to mark image ${image.id} as timed out:`, error);
        }
        return;
      }

      // Increment attempt counter
      pollAttemptsRef.current.set(image.id, currentAttempts + 1);

      try {
        logger.debug(`🔍 Checking status for image ${image.id} (task: ${taskId}, attempt: ${currentAttempts + 1}/${MAX_POLL_ATTEMPTS_PER_IMAGE})`)

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

          // Clear attempt counter for this image
          pollAttemptsRef.current.delete(image.id);

          // Invalider les queries pour forcer un refetch
          // IMPORTANT: Utiliser la même query key que dans useProjectImages
          await queryClient.invalidateQueries({
            queryKey: ['images', 'project', projectId],
          })

          // 💰 IMPORTANT: Rafraîchir les crédits après génération asynchrone
          if (result.status === 'completed') {
            await queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
            await queryClient.invalidateQueries({ queryKey: ['credit-stats'] })
            await queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })
          }
        }
      } catch (error) {
        logger.error(`❌ Error checking status for image ${image.id}:`, error)
      }
    }

    // Démarrer le polling
    const pollAllImages = async () => {
      // 🔧 FIX: Check global timeout
      const elapsedTime = Date.now() - pollStartTimeRef.current;
      if (elapsedTime > MAX_POLL_DURATION_MS) {
        logger.warn(`⏱️ Global polling timeout reached (${MAX_POLL_DURATION_MS / 1000 / 60} minutes). Stopping all polling.`);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

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
