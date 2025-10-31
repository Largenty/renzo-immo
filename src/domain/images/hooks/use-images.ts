/**
 * Hooks React Query pour le domaine Images
 * Couche de présentation utilisant les services du domaine
 */

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ManageImagesService } from '../services/manage-images'
import { GenerateImageService } from '../services/generate-image'
import { SupabaseImagesRepository } from '@/infra/adapters/images-repository.supabase'
import { SupabaseImageStorage } from '@/infra/adapters/image-storage.supabase'
import { NanoBananaAIGeneratorClient } from '@/infra/adapters/ai-generator.nanobanana.client'
import type { UploadImageInput, UpdateImageInput, RegenerateImageInput } from '../models/image'
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
 */
export function useGenerateImage() {
  const queryClient = useQueryClient()
  const { generateImageService } = getServices()

  return useMutation({
    mutationFn: async (imageId: string) => {
      return generateImageService.generateImage(imageId)
    },
    onSuccess: (result, imageId) => {
      // ✅ FIX: Invalider la liste des images du projet pour que le polling démarre
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })
      queryClient.invalidateQueries({ queryKey: ['images', 'project'] }) // Invalide TOUTES les listes d'images de projets

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
 */
export function useCheckGenerationStatus() {
  const queryClient = useQueryClient()
  const { generateImageService } = getServices()

  return useMutation({
    mutationFn: async ({ imageId, taskId }: { imageId: string; taskId: string }) => {
      return generateImageService.checkGenerationStatus(imageId, taskId)
    },
    onSuccess: (result, { imageId }) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ queryKey: ['images', imageId] })

      if (result.status === 'completed') {
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
 */
export function usePollingGenerationStatus(imageId: string, taskId: string | undefined, enabled: boolean = true) {
  const { generateImageService } = getServices()

  return useQuery({
    queryKey: ['images', 'generation-status', imageId, taskId],
    queryFn: () => {
      if (!taskId) throw new Error('No task ID')
      return generateImageService.checkGenerationStatus(imageId, taskId)
    },
    enabled: enabled && !!taskId,
    refetchInterval: (data) => {
      // Si l'image est terminée ou échouée, arrêter le polling
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      // Sinon, interroger toutes les 5 secondes
      return 5000
    },
    refetchOnWindowFocus: false,
  })
}
