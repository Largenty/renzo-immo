/**
 * React Hooks pour le domaine Projects
 * Expose les services du domaine via React Query
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SupabaseProjectsRepository } from '@/modules/projects'
import { SupabaseProjectStorage } from '@/modules/projects'
import { ManageProjectsService } from '@/modules/projects'
import { GetProjectStatsService } from '@/modules/projects'
import type { CreateProjectInput, UpdateProjectInput } from '@/modules/projects'
import { CannotDeleteProjectError } from '@/modules/projects'
import { logger } from '@/lib/logger';

/**
 * Hook : Récupérer tous les projets de l'utilisateur
 */
export function useProjects(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => {
      logger.debug('📋 Fetching projects for userId:', userId)
      if (!userId) return []

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const storage = new SupabaseProjectStorage(supabase)
      const service = new ManageProjectsService(repository, storage)

      const projects = await service.getProjects(userId)
      logger.debug('✅ Fetched', projects.length, 'projects')
      return projects
    },
    enabled: !!userId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook : Récupérer un projet par ID
 */
export function useProject(
  userId: string | undefined,
  projectId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['projects', userId, projectId],
    queryFn: async () => {
      if (!userId || !projectId) return null

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const storage = new SupabaseProjectStorage(supabase)
      const service = new ManageProjectsService(repository, storage)

      return service.getProjectById(projectId, userId)
    },
    enabled: !!userId && !!projectId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook : Récupérer les statistiques d'un projet
 */
export function useProjectStats(projectId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: async () => {
      if (!projectId) return null

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const service = new GetProjectStatsService(repository)

      return service.getProjectStats(projectId)
    },
    enabled: !!projectId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook : Créer un projet
 */
export function useCreateProject(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const storage = new SupabaseProjectStorage(supabase)
      const service = new ManageProjectsService(repository, storage)

      return service.createProject(userId, input)
    },
    onSuccess: async () => {
      logger.debug('🔄 Refetching queries for userId:', userId)
      // Forcer le refetch immédiat au lieu de juste invalider
      await queryClient.refetchQueries({ queryKey: ['projects', userId] })
      logger.debug('✅ Queries refetched')
      toast.success('Projet créé avec succès !')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du projet', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Mettre à jour un projet
 */
export function useUpdateProject(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      input,
      coverImage
    }: {
      projectId: string;
      input: UpdateProjectInput;
      coverImage?: File;
    }) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const storage = new SupabaseProjectStorage(supabase)
      const service = new ManageProjectsService(repository, storage)

      // Upload new cover image if provided
      let coverImageUrl: string | undefined | null = input.coverImageUrl

      if (coverImage) {
        try {
          logger.debug('📸 Uploading new cover image...', coverImage.name)
          coverImageUrl = await storage.uploadCoverImage(coverImage)
          logger.debug('✅ Cover image uploaded:', coverImageUrl)
        } catch (error) {
          logger.error('❌ Failed to upload cover image:', error)
          // Continue without updating the cover image
        }
      }

      // Update with the new cover image URL
      return service.updateProject(projectId, userId, {
        ...input,
        coverImageUrl: coverImageUrl,
      })
    },
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: ['projects', userId] })
      await queryClient.refetchQueries({ queryKey: ['projects', userId, data.id] })
      toast.success('Projet mis à jour !')
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      })
    },
  })
}

/**
 * Hook : Supprimer un projet
 */
export function useDeleteProject(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!userId) throw new Error('User ID is required')

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const storage = new SupabaseProjectStorage(supabase)
      const service = new ManageProjectsService(repository, storage)

      await service.deleteProject(projectId, userId)
      return projectId
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['projects', userId] })
      toast.success('Projet supprimé')
    },
    onError: (error) => {
      if (error instanceof CannotDeleteProjectError) {
        toast.error('Impossible de supprimer', {
          description: error.reason,
        })
      } else {
        toast.error('Erreur lors de la suppression', {
          description: error instanceof Error ? error.message : 'Une erreur est survenue',
        })
      }
    },
  })
}

/**
 * Hook : Récupérer les statistiques globales des projets de l'utilisateur
 */
export function useUserProjectsStats(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['user-projects-stats', userId],
    queryFn: async () => {
      if (!userId) return null

      const supabase = createClient()
      const repository = new SupabaseProjectsRepository(supabase)
      const service = new GetProjectStatsService(repository)

      return service.getUserProjectsStats(userId)
    },
    enabled: !!userId && enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
