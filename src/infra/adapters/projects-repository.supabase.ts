/**
 * Adapter : Projects Repository Supabase
 * Implémentation concrète du port IProjectsRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IProjectsRepository } from '@/domain/projects/ports/projects-repository'
import type { Project, UpdateProjectInput, ProjectStats } from '@/domain/projects/models/project'

/**
 * Type de la table Supabase projects
 */
interface ProjectRow {
  id: string
  user_id: string
  name: string
  address: string | null
  description: string | null
  cover_image_url: string | null
  total_images: number
  completed_images: number
  created_at: string
  updated_at: string
}

/**
 * Mapper : Row DB → Domain Model
 */
function mapRowToDomain(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    address: row.address || undefined,
    description: row.description || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    totalImages: row.total_images,
    completedImages: row.completed_images,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export class SupabaseProjectsRepository implements IProjectsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return (data as ProjectRow[]).map(mapRowToDomain)
  }

  async getProjectById(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    return mapRowToDomain(data as ProjectRow)
  }

  async createProject(
    userId: string,
    input: { name: string; address?: string; description?: string; coverImageUrl?: string }
  ): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: input.name,
        address: input.address || null,
        description: input.description || null,
        cover_image_url: input.coverImageUrl || null,
        total_images: 0,
        completed_images: 0,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return mapRowToDomain(data as ProjectRow)
  }

  async updateProject(
    projectId: string,
    userId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({
        name: input.name,
        address: input.address,
        description: input.description,
        cover_image_url: input.coverImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return mapRowToDomain(data as ProjectRow)
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  async getProjectStats(projectId: string): Promise<ProjectStats> {
    // Récupérer les statistiques depuis la table images
    const { data: images, error } = await this.supabase
      .from('images')
      .select('status')
      .eq('project_id', projectId)

    if (error) {
      throw new Error(`Failed to fetch project stats: ${error.message}`)
    }

    const stats: ProjectStats = {
      totalImages: images?.length || 0,
      completedImages: 0,
      pendingImages: 0,
      processingImages: 0,
      failedImages: 0,
    }

    images?.forEach((img) => {
      switch (img.status) {
        case 'completed':
          stats.completedImages++
          break
        case 'pending':
          stats.pendingImages++
          break
        case 'processing':
          stats.processingImages++
          break
        case 'failed':
          stats.failedImages++
          break
      }
    })

    return stats
  }

  async updateImageCounters(
    projectId: string,
    userId: string,
    totalImages: number,
    completedImages: number
  ): Promise<void> {
    // ✅ RLS FIX: Ajouter validation user_id pour prévenir mises à jour non autorisées
    const { error } = await this.supabase
      .from('projects')
      .update({
        total_images: totalImages,
        completed_images: completedImages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId) // ✅ SECURITY: Vérifier que le projet appartient à l'utilisateur

    if (error) {
      throw new Error(`Failed to update image counters: ${error.message}`)
    }
  }
}
