/**
 * Adapter : Project Storage Supabase
 * Implémentation concrète du port IProjectStorage avec Supabase Storage
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IProjectStorage } from '@/domain/projects/ports/project-storage'
import { logger } from '@/lib/logger';

export class SupabaseProjectStorage implements IProjectStorage {
  constructor(private readonly supabase: SupabaseClient) {}

  async uploadCoverImage(file: File): Promise<string> {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    // Upload vers le bucket project-covers
    const { data, error } = await this.supabase.storage
      .from('project-covers')
      .upload(fileName, file)

    if (error) {
      throw new Error(`Failed to upload cover image: ${error.message}`)
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('project-covers').getPublicUrl(data.path)

    return publicUrl
  }

  async deleteCoverImage(imageUrl: string): Promise<void> {
    // Extraire le path depuis l'URL
    const path = this.extractPathFromUrl(imageUrl, 'project-covers')

    if (!path) {
      logger.warn('Cannot extract path from URL:', imageUrl)
      return
    }

    const { error } = await this.supabase.storage.from('project-covers').remove([path])

    if (error) {
      throw new Error(`Failed to delete cover image: ${error.message}`)
    }
  }

  async uploadProjectImage(projectId: string, file: File): Promise<string> {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`

    // Upload vers le bucket images
    const { data, error } = await this.supabase.storage.from('images').upload(fileName, file)

    if (error) {
      throw new Error(`Failed to upload project image: ${error.message}`)
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('images').getPublicUrl(data.path)

    return publicUrl
  }

  async deleteProjectImages(projectId: string): Promise<void> {
    // Lister tous les fichiers du projet
    const { data: files, error: listError } = await this.supabase.storage
      .from('images')
      .list(projectId)

    if (listError) {
      throw new Error(`Failed to list project images: ${listError.message}`)
    }

    if (!files || files.length === 0) {
      return // Pas de fichiers à supprimer
    }

    // Supprimer tous les fichiers
    const filePaths = files.map((file) => `${projectId}/${file.name}`)

    const { error: deleteError } = await this.supabase.storage.from('images').remove(filePaths)

    if (deleteError) {
      throw new Error(`Failed to delete project images: ${deleteError.message}`)
    }
  }

  /**
   * Extraire le path depuis une URL Supabase Storage
   */
  private extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)`))
      return pathMatch ? pathMatch[1] : null
    } catch {
      return null
    }
  }
}
