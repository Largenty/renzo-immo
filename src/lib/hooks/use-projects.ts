/**
 * React Query hooks pour les projets
 * Gère le fetching, caching et mutations des projets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Project {
  id: string
  user_id: string
  name: string
  address?: string
  description?: string
  cover_image_url?: string
  total_images?: number
  completed_images?: number
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  address?: string
  description?: string
}

/**
 * Récupérer tous les projets de l'utilisateur
 */
export function useProjects(enabled: boolean = true) {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('🔍 Fetching projects...')
      const supabase = createClient()

      console.log('🔍 About to call supabase.auth.getUser()')
      // Vérifier si l'utilisateur est authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      console.log('🔍 After getUser call - user:', !!user, 'error:', !!userError)

      if (userError) {
        console.error('❌ Error getting user:', userError)
        throw userError
      }

      if (!user) {
        console.log('⚠️ No user found, returning empty array')
        return []
      }

      console.log('👤 User found:', user.id, 'Now fetching projects from DB...')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching projects:', error)
        throw error
      }

      console.log('✅ Projects loaded:', data?.length || 0, 'projects')
      return data as Project[]
    },
    enabled, // Ne charger que si enabled = true
    staleTime: 30 * 1000, // 30 seconds - optimized for real-time updates
    retry: 2, // Retry twice on failure
  })
}

/**
 * Récupérer un projet spécifique par ID
 */
export function useProject(projectId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      console.log('🔍 Fetching single project:', projectId)
      if (!projectId) return null

      const supabase = createClient()

      // Vérifier si l'utilisateur est authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('❌ Error getting user:', userError)
        throw userError
      }

      if (!user) {
        console.log('⚠️ No user found, returning null')
        return null
      }

      console.log('👤 User found, fetching project...')

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('❌ Error fetching project:', error)
        throw error
      }

      console.log('✅ Project loaded:', data?.name)
      return data as Project
    },
    enabled: !!projectId && enabled, // Ne lance la query que si projectId existe ET enabled
    staleTime: 1 * 60 * 1000, // 1 minute - optimized for real-time updates
  })
}

/**
 * Créer un nouveau projet
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const supabase = createClient()

      // Obtenir l'utilisateur actuel
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return project as Project
    },
    onSuccess: () => {
      // Invalider le cache pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projet créé avec succès !')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création du projet', {
        description: error.message,
      })
    },
  })
}

/**
 * Créer un projet avec une photo de couverture
 */
export function useCreateProjectWithCover() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      project,
      coverImage,
    }: {
      project: CreateProjectData
      coverImage?: File
    }) => {
      const supabase = createClient()

      let coverImageUrl: string | undefined = undefined

      // 1. Si cover image fournie, l'uploader d'abord
      if (coverImage) {
        try {
          // Générer un nom de fichier unique
          const fileExt = coverImage.name.split('.').pop()
          const fileName = `${crypto.randomUUID()}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-covers')
            .upload(fileName, coverImage)

          if (uploadError) {
            console.error('Cover image upload error:', uploadError)
            // Continue sans la cover si erreur
          } else {
            // Récupérer l'URL publique
            const {
              data: { publicUrl },
            } = supabase.storage.from('project-covers').getPublicUrl(uploadData.path)

            coverImageUrl = publicUrl
          }
        } catch (err) {
          console.error('Error uploading cover image:', err)
          // Continue sans la cover
        }
      }

      // 2. Obtenir l'utilisateur actuel
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // 3. Créer le projet avec l'URL de la cover (si disponible)
      const { data: createdProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id,
          cover_image_url: coverImageUrl,
        })
        .select()
        .single()

      if (projectError) throw projectError

      return {
        project: createdProject as Project,
        hasCoverImage: !!coverImageUrl,
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })

      if (data.hasCoverImage) {
        toast.success('Projet créé avec photo de couverture !')
      } else {
        toast.success('Projet créé avec succès !')
      }
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création', {
        description: error.message,
      })
    },
  })
}

/**
 * Mettre à jour un projet
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateProjectData> }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Project
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] })
      toast.success('Projet mis à jour !')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error.message,
      })
    },
  })
}

/**
 * Supprimer un projet
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('projects').delete().eq('id', projectId)

      if (error) throw error
      return projectId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Projet supprimé')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression', {
        description: error.message,
      })
    },
  })
}
