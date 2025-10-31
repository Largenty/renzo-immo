/**
 * Modèle du domaine : Furniture (Meuble)
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

export type FurnitureCategory =
  | 'seating'
  | 'table'
  | 'storage'
  | 'bed'
  | 'lighting'
  | 'decor'
  | 'appliance'
  | 'fixture'

export type RoomType =
  | 'salon'
  | 'chambre'
  | 'cuisine'
  | 'salle_a_manger'
  | 'salle_de_bain'
  | 'wc'
  | 'bureau'
  | 'entree'
  | 'couloir'
  | 'terrasse'
  | 'balcon'
  | 'jardin'
  | 'garage'
  | 'cave'
  | 'grenier'
  | 'buanderie'
  | 'dressing'
  | 'veranda'
  | 'mezzanine'
  | 'autre'

export interface FurnitureItem {
  id: string
  category: FurnitureCategory
  room_types: RoomType[]
  name_fr: string
  name_en: string
  generic_description?: string
  typical_dimensions?: {
    width?: number
    depth?: number
    height?: number
  }
  is_essential: boolean
  priority: number
  icon_name?: string
  image_url?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateFurnitureInput {
  category: FurnitureCategory
  room_types: RoomType[]
  name_fr: string
  name_en: string
  generic_description?: string
  typical_dimensions?: {
    width?: number
    depth?: number
    height?: number
  }
  is_essential?: boolean
  priority?: number
  icon_name?: string
  image_url?: string
}

export interface UpdateFurnitureInput {
  category?: FurnitureCategory
  room_types?: RoomType[]
  name_fr?: string
  name_en?: string
  generic_description?: string
  typical_dimensions?: {
    width?: number
    depth?: number
    height?: number
  }
  is_essential?: boolean
  priority?: number
  icon_name?: string
  image_url?: string
  is_active?: boolean
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const furnitureCategorySchema = z.enum([
  'seating',
  'table',
  'storage',
  'bed',
  'lighting',
  'decor',
  'appliance',
  'fixture',
])

export const roomTypeSchema = z.enum([
  'salon',
  'chambre',
  'cuisine',
  'salle_a_manger',
  'salle_de_bain',
  'wc',
  'bureau',
  'entree',
  'couloir',
  'terrasse',
  'balcon',
  'jardin',
  'garage',
  'cave',
  'grenier',
  'buanderie',
  'dressing',
  'veranda',
  'mezzanine',
  'autre',
])

export const typicalDimensionsSchema = z.object({
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  height: z.number().positive().optional(),
})

export const createFurnitureInputSchema = z.object({
  category: furnitureCategorySchema,
  room_types: z.array(roomTypeSchema).min(1, 'Au moins un type de pièce requis'),
  name_fr: z.string().min(1, 'Nom français requis').max(100),
  name_en: z.string().min(1, 'Nom anglais requis').max(100),
  generic_description: z.string().max(500).optional(),
  typical_dimensions: typicalDimensionsSchema.optional(),
  is_essential: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(50),
  icon_name: z.string().max(50).optional(),
  image_url: z.string().url().optional(),
})

export const updateFurnitureInputSchema = z.object({
  category: furnitureCategorySchema.optional(),
  room_types: z.array(roomTypeSchema).min(1).optional(),
  name_fr: z.string().min(1).max(100).optional(),
  name_en: z.string().min(1).max(100).optional(),
  generic_description: z.string().max(500).optional(),
  typical_dimensions: typicalDimensionsSchema.optional(),
  is_essential: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  icon_name: z.string().max(50).optional(),
  image_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
})
