/**
 * Hooks React Query pour le domaine Images
 * Couche de présentation utilisant les services du domaine
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ManageImagesService } from '@/modules/images'
import { GenerateImageService } from '@/modules/images'
import { SupabaseImagesRepository } from '@/modules/images'
import { SupabaseImageStorage } from '@/modules/images'
import { NanoBananaAIGeneratorClient } from '@/modules/images'
import type { UploadImageInput, UpdateImageInput, RegenerateImageInput } from '@/modules/images'
import { toast } from 'sonner'

/**
 * Créer les instances des services (singleton pattern)
 * Note: Le AIGenerator client est un stub - les vraies opérations doivent passer par des API routes
 */
function getServices() {
  const supabase = createClient()

  const imagesRepository = new SupabaseImagesRepository(supabase)
  const imageStorage = new SupabaseImageStorage(supabase)
  const aiGenerator = new NanoBananaAIGeneratorClient()

  const manageImagesService = new ManageImagesService(imagesRepository, imageStorage)
  const generateImageService = new GenerateImageService(imagesRepository, aiGenerator)

  return {
    manageImagesService,
    generateImageService,
  }
}

/**
 * Hook pour récupérer toutes les images d'un projet
 */
export function useProjectImages(projectId: string) {
  const { manageImagesService } = getServices()

  return useQuery({
    queryKey: ['images', 'project', projectId],
    queryFn: () => manageImagesService.getProjectImages(projectId),
    enabled: !!projectId,
  })
}

/**
 * Hook pour récupérer une image par ID
 */
export function useImage(imageId: string) {
  const { manageImagesService } = getServices()

  return useQuery({
    queryKey: ['images', imageId],
    queryFn: () => manageImagesService.getImageById(imageId),
    enabled: !!imageId,
  })
}

/**
 * Hook pour uploader une nouvelle image
 */
export function useUploadImage() {
  const queryClient = useQueryClient()
  const { manageImagesService } = getServices()

  return useMutation({
    mutationFn: async ({ userId, input }: { userId: string; input: UploadImageInput }) => {
      return manageImagesService.uploadImage(userId, input)
    },
    onSuccess: (image) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', 'project', image.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', image.projectId] })

      toast.success('Image uploadée avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'upload : ${error.message}`)
    },
  })
}

/**
 * Hook pour mettre à jour une image
 */
export function useUpdateImage() {
  const queryClient = useQueryClient()
  const { manageImagesService } = getServices()

  return useMutation({
    mutationFn: async ({ imageId, input }: { imageId: string; input: UpdateImageInput }) => {
      return manageImagesService.updateImage(imageId, input)
    },
    onSuccess: (image) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', image.id] })
      queryClient.invalidateQueries({ queryKey: ['images', 'project', image.projectId] })

      toast.success('Image mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`)
    },
  })
}

/**
 * Hook pour supprimer une image
 */
export function useDeleteImage() {
  const queryClient = useQueryClient()
  const { manageImagesService } = getServices()

  return useMutation({
    mutationFn: async ({ imageId, projectId }: { imageId: string; projectId: string }) => {
      await manageImagesService.deleteImage(imageId)
      return { imageId, projectId }
    },
    onSuccess: ({ projectId }) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', 'project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })

      toast.success('Image supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`)
    },
  })
}

/**
 * Hook pour générer/transformer une image avec l'IA
 * Appelle l'API route au lieu d'utiliser directement le service
 */
export function useGenerateImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      return response.json()
    },
    onSuccess: (result, imageId) => {
      // ✅ FIX: Invalider la liste des images du projet pour que le polling démarre
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })
      queryClient.invalidateQueries({ queryKey: ['images', 'project'] }) // Invalide TOUTES les listes d'images de projets

      // 💰 IMPORTANT: Rafraîchir les crédits après génération d'image
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
      queryClient.invalidateQueries({ queryKey: ['credit-stats'] })
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })

      if (result.status === 'completed') {
        toast.success('Image générée avec succès')
      } else {
        toast.info('Génération en cours... Cela peut prendre quelques minutes')
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la génération : ${error.message}`)
    },
  })
}

/**
 * Hook pour régénérer une image avec de nouveaux paramètres
 */
export function useRegenerateImage() {
  const queryClient = useQueryClient()
  const { generateImageService } = getServices()

  return useMutation({
    mutationFn: async ({ imageId, input }: { imageId: string; input: RegenerateImageInput }) => {
      return generateImageService.regenerateImage(imageId, input)
    },
    onSuccess: (result, { imageId }) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })

      // 💰 IMPORTANT: Rafraîchir les crédits après régénération d'image
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
      queryClient.invalidateQueries({ queryKey: ['credit-stats'] })
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })

      if (result.status === 'completed') {
        toast.success('Image régénérée avec succès')
      } else {
        toast.info('Régénération en cours... Cela peut prendre quelques minutes')
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la régénération : ${error.message}`)
    },
  })
}

/**
 * Hook pour vérifier le statut d'une génération en cours
 * Appelle l'API route au lieu d'utiliser directement le service
 */
export function useCheckGenerationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageId, taskId }: { imageId: string; taskId: string }) => {
      const response = await fetch('/api/check-generation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId, taskId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check status')
      }

      return response.json()
    },
    onSuccess: (result, { imageId }) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })

      // 💰 IMPORTANT: Rafraîchir les crédits quand l'image est générée avec succès
      if (result.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
        queryClient.invalidateQueries({ queryKey: ['credit-stats'] })
        queryClient.invalidateQueries({ queryKey: ['credit-transactions'] })
        toast.success('Image générée avec succès')
      } else if (result.status === 'failed') {
        toast.error('La génération a échoué')
      }
    },
  })
}

/**
 * Hook pour le polling automatique du statut de génération
 * Utilise useQuery avec refetchInterval pour interroger périodiquement le statut
 * Appelle l'API route au lieu d'utiliser directement le service
 */
export function usePollingGenerationStatus(imageId: string, taskId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['images', 'generation-status', imageId, taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('No task ID')

      const response = await fetch('/api/check-generation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId, taskId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check status')
      }

      return response.json()
    },
    enabled: enabled && !!taskId,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchOnWindowFocus: false,
  })
}
