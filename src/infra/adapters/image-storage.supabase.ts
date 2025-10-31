/**
 * Adapter : Image Storage Supabase
 * Implémentation concrète du port IImageStorage avec Supabase Storage
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IImageStorage } from '@/domain/images/ports/image-storage'
import { logger } from '@/lib/logger';

export class SupabaseImageStorage implements IImageStorage {
  constructor(private readonly supabase: SupabaseClient) {}

  async uploadImage(projectId: string, file: File): Promise<string> {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`

    // Upload vers le bucket images
    const { data, error } = await this.supabase.storage.from('images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('images').getPublicUrl(data.path)

    return publicUrl
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extraire le path depuis l'URL
    const path = this.extractPathFromUrl(imageUrl, 'images')

    if (!path) {
      logger.warn('Cannot extract path from URL:', imageUrl)
      return
    }

    const { error } = await this.supabase.storage.from('images').remove([path])

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }

  async getImageMetadata(imageUrl: string): Promise<{
    size: number
    contentType: string
    lastModified: Date
  } | null> {
    // Extraire le path depuis l'URL
    const path = this.extractPathFromUrl(imageUrl, 'images')

    if (!path) {
      return null
    }

    // Récupérer les métadonnées du fichier
    const { data, error } = await this.supabase.storage.from('images').list(path.split('/')[0], {
      search: path.split('/').slice(1).join('/'),
    })

    if (error || !data || data.length === 0) {
      return null
    }

    const file = data[0]

    return {
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      lastModified: new Date(file.created_at),
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
