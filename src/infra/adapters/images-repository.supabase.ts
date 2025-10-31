/**
 * Adapter : Images Repository Supabase
 * Implémentation concrète du port IImagesRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IImagesRepository } from '@/domain/images/ports/images-repository'
import type { Image, ImageStatus, UpdateImageInput } from '@/domain/images/models/image'

/**
 * Type de la table Supabase images
 */
interface ImageRow {
  id: string
  project_id: string
  user_id: string
  original_url: string
  transformed_url: string | null
  transformation_type?: string | null // 🔄 FALLBACK: String slug (ancien nom de colonne)
  transformation_type_id?: string | null // ✅ NOUVEAU: UUID foreign key
  status: ImageStatus
  custom_prompt: string | null
  with_furniture: boolean | null
  furniture_ids?: string[] | null // ✅ AJOUTÉ: IDs des meubles sélectionnés
  room_type: string | null
  custom_room: string | null
  metadata: any | null // ✅ AJOUTÉ: Colonne metadata pour le taskId
  processing_started_at: string | null
  processing_completed_at: string | null
  processing_duration_ms: number | null
  error_message: string | null
  created_at: string
  updated_at: string
}

/**
 * Mapper : Row DB → Domain Model
 */
function mapRowToDomain(row: ImageRow): Image {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    originalUrl: row.original_url,
    transformedUrl: row.transformed_url || undefined,
    // 🔄 COMPATIBILITÉ: Utiliser transformation_type_id si disponible, sinon transformation_type
    transformationType: (row.transformation_type_id || row.transformation_type) as string,
    status: row.status,
    customPrompt: row.custom_prompt || undefined,
    withFurniture: row.with_furniture || undefined,
    furnitureIds: row.furniture_ids || undefined, // ✅ AJOUTÉ: mapper furniture_ids
    roomType: row.room_type as any,
    customRoom: row.custom_room || undefined,
    metadata: row.metadata || undefined, // ✅ AJOUTÉ: Mapper la colonne metadata
    processingStartedAt: row.processing_started_at ? new Date(row.processing_started_at) : undefined,
    processingCompletedAt: row.processing_completed_at
      ? new Date(row.processing_completed_at)
      : undefined,
    processingDurationMs: row.processing_duration_ms || undefined,
    errorMessage: row.error_message || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export class SupabaseImagesRepository implements IImagesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProjectImages(projectId: string): Promise<Image[]> {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch project images: ${error.message}`)
    }

    return (data as ImageRow[]).map(mapRowToDomain)
  }

  async getImageById(imageId: string): Promise<Image | null> {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch image: ${error.message}`)
    }

    return mapRowToDomain(data as ImageRow)
  }

  async createImage(image: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>): Promise<Image> {
    // 🔄 UTILISER transformation_type (string) temporairement
    // TODO: Migrer vers transformation_type_id (UUID) une fois le schéma mis à jour
    const { data, error} = await this.supabase
      .from('images')
      .insert({
        project_id: image.projectId,
        user_id: image.userId,
        original_url: image.originalUrl,
        transformed_url: image.transformedUrl || null,
        transformation_type: image.transformationType, // 🔄 Utiliser string slug
        status: image.status,
        custom_prompt: image.customPrompt || null,
        with_furniture: image.withFurniture || null,
        furniture_ids: image.furnitureIds || null, // ✅ AJOUTÉ: Array d'UUIDs des meubles
        room_type: image.roomType || null,
        custom_room: image.customRoom || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create image: ${error.message}`)
    }

    return mapRowToDomain(data as ImageRow)
  }

  async updateImage(imageId: string, updates: Partial<UpdateImageInput>): Promise<Image> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.transformationType !== undefined) {
      updateData.transformation_type = updates.transformationType // 🔄 Utiliser string slug
    }
    if (updates.customPrompt !== undefined) {
      updateData.custom_prompt = updates.customPrompt
    }
    if (updates.withFurniture !== undefined) {
      updateData.with_furniture = updates.withFurniture
    }
    if (updates.furnitureIds !== undefined) {
      updateData.furniture_ids = updates.furnitureIds // ✅ AJOUTÉ: Mise à jour des IDs de meubles
    }
    if (updates.roomType !== undefined) {
      updateData.room_type = updates.roomType
    }
    if (updates.customRoom !== undefined) {
      updateData.custom_room = updates.customRoom
    }

    const { data, error } = await this.supabase
      .from('images')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update image: ${error.message}`)
    }

    return mapRowToDomain(data as ImageRow)
  }

  async deleteImage(imageId: string): Promise<void> {
    const { error } = await this.supabase.from('images').delete().eq('id', imageId)

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`)
    }
  }

  async updateImageStatus(
    imageId: string,
    status: ImageStatus,
    errorMessage?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('images')
      .update({
        status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to update image status: ${error.message}`)
    }
  }

  async updateTransformedUrl(imageId: string, transformedUrl: string): Promise<void> {
    const { error } = await this.supabase
      .from('images')
      .update({
        transformed_url: transformedUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to update transformed URL: ${error.message}`)
    }
  }

  async markAsProcessing(imageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('images')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to mark image as processing: ${error.message}`)
    }
  }

  async markAsCompleted(
    imageId: string,
    transformedUrl: string,
    durationMs: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('images')
      .update({
        status: 'completed',
        transformed_url: transformedUrl,
        processing_completed_at: new Date().toISOString(),
        processing_duration_ms: durationMs,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to mark image as completed: ${error.message}`)
    }
  }

  async markAsFailed(imageId: string, errorMessage: string): Promise<void> {
    const { error } = await this.supabase
      .from('images')
      .update({
        status: 'failed',
        error_message: errorMessage,
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    if (error) {
      throw new Error(`Failed to mark image as failed: ${error.message}`)
    }
  }
}
