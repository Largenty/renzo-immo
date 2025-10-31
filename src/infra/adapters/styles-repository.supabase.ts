/**
 * Adapter : Styles Repository Supabase
 * Implémentation concrète du port IStylesRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CustomStyle,
  CreateCustomStyleInput,
  UpdateCustomStyleInput,
} from '@/domain/styles/models/transformation-style'
import type { IStylesRepository } from '@/domain/styles/ports/styles-repository'
import { generateStyleSlug } from '@/domain/styles/business-rules/generate-slug'

/**
 * Type de la table Supabase transformation_types
 */
interface TransformationTypeRow {
  id: string
  user_id: string
  slug: string
  name: string
  description: string | null
  icon_name: string | null
  category: string | null
  prompt_template: string | null
  example_image_url: string | null
  allow_furniture_toggle: boolean
  is_system: boolean
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Mapper : Row DB → Domain Model
 */
function mapRowToDomain(row: TransformationTypeRow): CustomStyle {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    iconName: row.icon_name,
    category: row.category,
    promptTemplate: row.prompt_template,
    exampleImageUrl: row.example_image_url,
    allowFurnitureToggle: row.allow_furniture_toggle,
    isSystem: row.is_system,
    isActive: row.is_active,
    isPublic: row.is_public,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

/**
 * Adapter Supabase pour le repository de styles
 */
export class SupabaseStylesRepository implements IStylesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCustomStyles(userId: string): Promise<CustomStyle[]> {
    const { data, error } = await this.supabase
      .from('transformation_types')
      .select('*')
      .eq('user_id', userId)
      .eq('is_system', false)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch custom styles: ${error.message}`)
    }

    return (data as TransformationTypeRow[]).map(mapRowToDomain)
  }

  async getCustomStyleById(userId: string, styleId: string): Promise<CustomStyle | null> {
    const { data, error } = await this.supabase
      .from('transformation_types')
      .select('*')
      .eq('id', styleId)
      .eq('user_id', userId)
      .eq('is_system', false)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch custom style: ${error.message}`)
    }

    return mapRowToDomain(data as TransformationTypeRow)
  }

  async getAllTransformationTypes(userId: string): Promise<CustomStyle[]> {
    // Récupérer les types système + les custom de l'utilisateur
    const { data, error } = await this.supabase
      .from('transformation_types')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${userId}`)
      .eq('is_active', true)
      .order('is_system', { ascending: false }) // Système en premier
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch transformation types: ${error.message}`)
    }

    return (data as TransformationTypeRow[]).map(mapRowToDomain)
  }

  async createCustomStyle(
    userId: string,
    input: CreateCustomStyleInput
  ): Promise<CustomStyle> {
    // Générer le slug
    const slug = generateStyleSlug(input.name)

    const { data, error } = await this.supabase
      .from('transformation_types')
      .insert({
        user_id: userId,
        slug,
        name: input.name,
        description: input.description || null,
        icon_name: input.iconName || 'Sparkles',
        category: 'custom',
        prompt_template: input.promptTemplate || null,
        allow_furniture_toggle: input.allowFurnitureToggle ?? false,
        is_system: false,
        is_active: true,
        is_public: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create custom style: ${error.message}`)
    }

    return mapRowToDomain(data as TransformationTypeRow)
  }

  async updateCustomStyle(
    userId: string,
    styleId: string,
    input: UpdateCustomStyleInput
  ): Promise<CustomStyle> {
    const { data, error } = await this.supabase
      .from('transformation_types')
      .update({
        name: input.name,
        description: input.description,
        icon_name: input.iconName,
        prompt_template: input.promptTemplate,
        allow_furniture_toggle: input.allowFurnitureToggle,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', styleId)
      .eq('user_id', userId)
      .eq('is_system', false) // Sécurité : ne jamais modifier un style système
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update custom style: ${error.message}`)
    }

    return mapRowToDomain(data as TransformationTypeRow)
  }

  async deleteCustomStyle(userId: string, styleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('transformation_types')
      .delete()
      .eq('id', styleId)
      .eq('user_id', userId)
      .eq('is_system', false) // Sécurité : ne jamais supprimer un style système

    if (error) {
      throw new Error(`Failed to delete custom style: ${error.message}`)
    }
  }
}
