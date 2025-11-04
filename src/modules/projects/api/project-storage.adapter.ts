/**
 * Adapter Supabase pour le stockage des fichiers de projets
 * Implémente IProjectStorage
 */

import type { IProjectStorage } from '@/domain/projects/ports/project-storage'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

export class SupabaseProjectStorage implements IProjectStorage {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Upload une image de couverture dans le bucket Supabase Storage
   */
  async uploadCoverImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `covers/${fileName}`

      logger.debug('📤 Uploading cover image:', filePath)

      const { data, error } = await this.supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        logger.error('❌ Failed to upload cover image:', error)
        throw new Error(`Failed to upload cover image: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('projects')
        .getPublicUrl(filePath)

      logger.debug('✅ Cover image uploaded:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      logger.error('❌ Upload error:', error)
      throw error
    }
  }

  /**
   * Supprime une image de couverture du bucket Supabase Storage
   */
  async deleteCoverImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/projects/')

      if (pathParts.length < 2) {
        logger.warn('⚠️ Invalid image URL format:', imageUrl)
        return
      }

      const filePath = pathParts[1]
      logger.debug('🗑️ Deleting cover image:', filePath)

      const { error } = await this.supabase.storage
        .from('projects')
        .remove([filePath])

      if (error) {
        logger.error('❌ Failed to delete cover image:', error)
        throw new Error(`Failed to delete cover image: ${error.message}`)
      }

      logger.debug('✅ Cover image deleted')
    } catch (error) {
      logger.error('❌ Delete error:', error)
      // Don't throw - deletion failures shouldn't block operations
    }
  }

  /**
   * Upload une image de projet dans le bucket Supabase Storage
   */
  async uploadProjectImage(projectId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `projects/${projectId}/${fileName}`

      logger.debug('📤 Uploading project image:', filePath)

      const { data, error } = await this.supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        logger.error('❌ Failed to upload project image:', error)
        throw new Error(`Failed to upload project image: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      logger.debug('✅ Project image uploaded:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      logger.error('❌ Upload error:', error)
      throw error
    }
  }

  /**
   * Supprime toutes les images d'un projet du bucket Supabase Storage
   */
  async deleteProjectImages(projectId: string): Promise<void> {
    try {
      logger.debug('🗑️ Deleting all images for project:', projectId)

      // List all files in the project folder
      const { data: files, error: listError } = await this.supabase.storage
        .from('images')
        .list(`projects/${projectId}`)

      if (listError) {
        logger.error('❌ Failed to list project images:', listError)
        throw new Error(`Failed to list project images: ${listError.message}`)
      }

      if (!files || files.length === 0) {
        logger.debug('✅ No images to delete')
        return
      }

      // Delete all files
      const filePaths = files.map(file => `projects/${projectId}/${file.name}`)
      const { error: deleteError } = await this.supabase.storage
        .from('images')
        .remove(filePaths)

      if (deleteError) {
        logger.error('❌ Failed to delete project images:', deleteError)
        throw new Error(`Failed to delete project images: ${deleteError.message}`)
      }

      logger.debug('✅ Deleted', files.length, 'images')
    } catch (error) {
      logger.error('❌ Delete error:', error)
      // Don't throw - deletion failures shouldn't block operations
    }
  }
}
