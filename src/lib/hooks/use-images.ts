/**
 * React Query hooks pour les images
 * Gère le fetching et mutations des images de projet
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { TransformationType } from '@/types/dashboard'
import { formatErrorForToast, parseSupabaseError, retryWithBackoff } from '@/lib/errors'

export interface Image {
  id: string
  project_id: string
  original_url: string
  transformed_url?: string
  transformation_type: TransformationType
  status: 'pending' | 'processing' | 'completed' | 'failed'
  custom_prompt?: string
  with_furniture?: boolean
  room_type?: string
  error_message?: string
  created_at: string
  completed_at?: string
}

/**
 * Hook pour récupérer toutes les images d'un projet avec polling intelligent
 *
 * Optimisé avec polling conditionnel : refetch uniquement si des images sont en processing.
 * Utilise React Query pour le caching et la synchronisation automatique.
 *
 * @param {string | null} projectId - Identifiant du projet
 * @returns {UseQueryResult<Image[]>} Query result contenant les images
 *
 * @example
 * ```tsx
 * const { data: images, isLoading } = useProjectImages(projectId);
 * if (isLoading) return <Skeleton />;
 * return <ImageList images={images} />;
 * ```
 */
export function useProjectImages(projectId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['projects', projectId, 'images'],
    queryFn: async () => {
      console.log('🖼️ Fetching images for project:', projectId)
      if (!projectId) return []

      const supabase = createClient()

      // Vérifier si l'utilisateur est authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('❌ Error getting user:', userError)
        throw userError
      }

      if (!user) {
        console.log('⚠️ No user found, returning empty array')
        return []
      }

      console.log('👤 User found, fetching images...')

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching images:', error)
        throw error
      }

      console.log('✅ Images loaded:', data?.length || 0)
      return data as Image[]
    },
    enabled: !!projectId && enabled, // Ne lance que si projectId existe ET enabled
    staleTime: 10 * 1000, // 10 seconds - optimized for real-time transformation status
    refetchOnWindowFocus: true, // Refetch quand on revient sur la page
    // Polling conditionnel : seulement si des images sont en processing
    refetchInterval: (query) => {
      // React Query v4+ passe l'objet query complet, pas les données directement
      const images = query.state.data as Image[] | undefined
      const hasProcessingImages = images?.some(img => img.status === 'processing')
      return hasProcessingImages ? 5000 : false // Poll chaque 5s si processing, sinon désactivé
    },
  })
}

/**
 * Hook pour uploader une nouvelle image dans un projet
 *
 * Gère l'upload du fichier vers Supabase Storage et la création de l'entrée en base.
 * Invalide automatiquement le cache des images après succès.
 *
 * @returns {UseMutationResult} Mutation result avec méthodes mutate/mutateAsync
 *
 * @example
 * ```tsx
 * const uploadImage = useUploadImage();
 * await uploadImage.mutateAsync({
 *   projectId: "abc123",
 *   file: imageFile,
 *   transformationType: "virtual_staging",
 *   customPrompt: "Style moderne"
 * });
 * ```
 */
export function useUploadImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      file,
      transformationType,
      customPrompt,
      withFurniture,
      roomType,
    }: {
      projectId: string
      file: File
      transformationType: TransformationType
      customPrompt?: string
      withFurniture?: boolean
      roomType?: string
    }) => {
      const supabase = createClient()

      // 0. Récupérer l'utilisateur authentifié
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // 1. Upload l'image originale au Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`${projectId}/${fileName}`, file)

      if (uploadError) throw uploadError

      // 2. Récupérer l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(uploadData.path)

      // 3. Créer l'entrée dans la table images
      const { data: image, error: dbError } = await supabase
        .from('images')
        .insert({
          project_id: projectId,
          user_id: user.id,
          original_url: publicUrl,
          transformation_type: transformationType,
          custom_prompt: customPrompt,
          with_furniture: withFurniture,
          room_type: roomType,
          status: 'pending',
        })
        .select()
        .single()

      if (dbError) throw dbError

      return image as Image
    },
    onSuccess: (_, variables) => {
      // Invalider le cache des images du projet
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'images'],
      })
      toast.success('Image ajoutée au projet')
    },
    onError: (error: unknown) => {
      const errorInfo = formatErrorForToast(parseSupabaseError(error))
      toast.error(errorInfo.title, {
        description: errorInfo.description,
      })
    },
  })
}

/**
 * Hook pour regénérer une image avec un nouveau type de transformation
 *
 * Permet de changer le type de transformation et relancer la génération.
 * Réinitialise le statut à "pending" et supprime l'ancienne image transformée.
 *
 * @returns {UseMutationResult} Mutation result
 *
 * @example
 * ```tsx
 * const regenerateImage = useRegenerateImage();
 * await regenerateImage.mutateAsync({
 *   imageId: "img123",
 *   projectId: "proj456",
 *   newType: "declutter",
 *   customPrompt: "Enlever tous les meubles"
 * });
 * ```
 */
export function useRegenerateImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      imageId,
      projectId,
      newType,
      customPrompt,
    }: {
      imageId: string
      projectId: string
      newType: TransformationType
      customPrompt?: string
    }) => {
      const supabase = createClient()

      // Mettre à jour le type de transformation et réinitialiser le statut
      const { data, error } = await supabase
        .from('images')
        .update({
          transformation_type: newType,
          custom_prompt: customPrompt,
          status: 'pending',
          transformed_url: null,
          completed_at: null,
        })
        .eq('id', imageId)
        .select()
        .single()

      if (error) throw error

      // TODO: Déclencher le job de transformation IA ici
      // await triggerTransformationJob(data.id)

      return data as Image
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'images'],
      })
      toast.success('Régénération lancée...')
    },
    onError: (error: unknown) => {
      const errorInfo = formatErrorForToast(parseSupabaseError(error))
      toast.error(errorInfo.title, {
        description: errorInfo.description,
      })
    },
  })
}

/**
 * Hook pour supprimer une image d'un projet
 *
 * Supprime l'entrée en base de données. Les fichiers dans Storage sont nettoyés
 * automatiquement par les politiques Supabase.
 *
 * @returns {UseMutationResult} Mutation result
 *
 * @example
 * ```tsx
 * const deleteImage = useDeleteImage();
 * await deleteImage.mutateAsync({
 *   imageId: "img123",
 *   projectId: "proj456"
 * });
 * ```
 */
export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageId, projectId: _projectId }: { imageId: string; projectId: string }) => {
      const supabase = createClient()

      // Supprimer l'entrée de la DB (les fichiers Storage sont nettoyés par politique Supabase)
      const { error } = await supabase.from('images').delete().eq('id', imageId)

      if (error) throw error

      return imageId
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'images'],
      })
      toast.success('Image supprimée')
    },
    onError: (error: unknown) => {
      const errorInfo = formatErrorForToast(parseSupabaseError(error))
      toast.error(errorInfo.title, {
        description: errorInfo.description,
      })
    },
  })
}

/**
 * Hook pour générer une image transformée avec l'IA (NanoBanana)
 *
 * Lance la génération d'image via l'API NanoBanana et démarre le polling automatique
 * pour vérifier le statut de la transformation. Affiche des notifications toast.
 *
 * @returns {UseMutationResult} Mutation result
 *
 * @example
 * ```tsx
 * const generateImage = useGenerateImage();
 * await generateImage.mutateAsync({
 *   imageId: "img123",
 *   projectId: "proj456"
 * });
 * // Le polling démarre automatiquement
 * ```
 */
export function useGenerateImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageId, projectId }: { imageId: string; projectId: string }) => {
      // Appeler l'API route qui gère NanoBanana
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Generate image API error:', error)
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()

      // Si NanoBanana retourne un taskId, on commence le polling
      if (data.taskId && data.status === 'processing') {
        console.log('⏳ Image generation started, polling for result...')
        return { imageId, projectId, taskId: data.taskId, status: 'processing' }
      }

      return data
    },
    onSuccess: (data, variables) => {
      if (data.status === 'processing') {
        // L'image est en cours de génération
        toast.success('Génération lancée !', {
          description: 'L\'image sera prête dans quelques minutes.',
        })

        // Invalider pour rafraîchir et montrer le statut "processing"
        queryClient.invalidateQueries({
          queryKey: ['projects', variables.projectId, 'images'],
        })

        // Démarrer le polling
        startPolling(data.imageId, variables.projectId, queryClient)
      } else if (data.status === 'completed') {
        queryClient.invalidateQueries({
          queryKey: ['projects', variables.projectId, 'images'],
        })
        toast.success('Image générée avec succès !')
      }
    },
    onError: (error: unknown) => {
      console.error('Generate image error:', error)
      const errorInfo = formatErrorForToast(parseSupabaseError(error))
      toast.error(errorInfo.title, {
        description: errorInfo.description,
      })
    },
  })
}

/**
 * Fonction interne pour vérifier le statut de génération (polling)
 *
 * Appelle l'API route pour vérifier si la génération est terminée.
 *
 * @param {string} imageId - Identifiant de l'image à vérifier
 * @returns {Promise<{status: string}>} Statut de génération
 * @private
 */
async function checkGenerationStatus(imageId: string) {
  const response = await fetch('/api/check-generation-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageId }),
  })

  if (!response.ok) {
    throw new Error('Failed to check status')
  }

  return response.json()
}

/**
 * Fonction interne pour démarrer le polling de statut de génération
 *
 * Vérifie le statut toutes les 10 secondes jusqu'à ce que la génération soit terminée,
 * échouée, ou que le nombre maximum de tentatives soit atteint (60 tentatives = 10 min).
 *
 * @param {string} imageId - Identifiant de l'image en cours de génération
 * @param {string} projectId - Identifiant du projet parent
 * @param {any} queryClient - Instance du QueryClient React Query
 * @private
 */
function startPolling(imageId: string, projectId: string, queryClient: any) {
  const maxAttempts = 60 // 60 tentatives max (10 minutes si intervalle de 10s)
  let attempts = 0

  const intervalId = setInterval(async () => {
    attempts++

    try {
      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}`)
      const result = await checkGenerationStatus(imageId)

      if (result.status === 'completed') {
        console.log('✅ Image generation completed!')
        clearInterval(intervalId)

        // Rafraîchir les images
        queryClient.invalidateQueries({
          queryKey: ['projects', projectId, 'images'],
        })

        toast.success('Image générée avec succès !')
      } else if (result.status === 'failed') {
        console.error('❌ Image generation failed')
        clearInterval(intervalId)

        queryClient.invalidateQueries({
          queryKey: ['projects', projectId, 'images'],
        })

        toast.error('La génération a échoué', {
          description: 'Veuillez réessayer.',
        })
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Max polling attempts reached')
        clearInterval(intervalId)
        toast.error('Délai dépassé', {
          description: 'La génération prend plus de temps que prévu.',
        })
      }
    } catch (error) {
      console.error('Polling error:', error)

      if (attempts >= maxAttempts) {
        clearInterval(intervalId)
      }
    }
  }, 10000) // Vérifier toutes les 10 secondes
}
