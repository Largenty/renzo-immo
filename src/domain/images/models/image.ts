/**
 * Modèle du domaine : Image
 * Représente une image de projet (originale + transformée)
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type RoomType =
  | 'salon'
  | 'cuisine'
  | 'chambre'
  | 'salle_de_bain'
  | 'salle_a_manger'
  | 'bureau'
  | 'entree'
  | 'couloir'
  | 'autre'

export interface Image {
  id: string
  projectId: string
  userId: string
  originalUrl: string
  transformedUrl?: string
  transformationType: string // TransformationType from styles domain
  status: ImageStatus
  customPrompt?: string
  withFurniture?: boolean
  roomType?: RoomType
  customRoom?: string
  roomWidth?: number  // Largeur de la pièce en mètres
  roomLength?: number // Longueur de la pièce en mètres
  roomArea?: number   // Surface en m²
  errorMessage?: string
  metadata?: Record<string, any>
  processingStartedAt?: Date
  processingCompletedAt?: Date
  processingDurationMs?: number
  createdAt: Date
  updatedAt: Date
}

export interface TransformImageResult {
  imageId: string
  status: ImageStatus
  taskId?: string
  transformedUrl?: string
  message?: string
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const imageStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])

export const roomTypeSchema = z.enum([
  'salon',
  'cuisine',
  'chambre',
  'salle_de_bain',
  'salle_a_manger',
  'bureau',
  'entree',
  'couloir',
  'autre',
])

export const imageSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  originalUrl: z.string().url(),
  transformedUrl: z.string().url().optional(),
  transformationType: z.string().min(1),
  status: imageStatusSchema,
  customPrompt: z.string().max(5000).optional(),
  withFurniture: z.boolean().optional(),
  roomType: roomTypeSchema.optional(),
  customRoom: z.string().max(200).optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  processingStartedAt: z.date().optional(),
  processingCompletedAt: z.date().optional(),
  processingDurationMs: z.number().int().nonnegative().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ============================================
// SCHÉMAS D'ENTRÉE
// ============================================

export const uploadImageInputSchema = z.object({
  projectId: z.string().uuid('ID de projet invalide'),
  file: typeof File !== 'undefined' ? z.instanceof(File, { message: 'Fichier requis' }) : z.any(),
  transformationType: z.string().min(1, 'Type de transformation requis'),
  customPrompt: z.string().max(5000).optional(),
  withFurniture: z.boolean().optional(),
  furnitureIds: z.array(z.string().uuid()).optional(),
  roomType: roomTypeSchema.optional(),
  customRoom: z.string().max(200).optional(),
  roomWidth: z.number().positive().max(100).optional(),   // 📏 Largeur en mètres (max 100m)
  roomLength: z.number().positive().max(100).optional(),  // 📏 Longueur en mètres (max 100m)
  roomArea: z.number().positive().max(10000).optional(),  // 📏 Surface en m² (max 10000m²)
})

export const updateImageInputSchema = z.object({
  transformationType: z.string().min(1).optional(),
  customPrompt: z.string().max(5000).nullable().optional(),
  withFurniture: z.boolean().optional(),
  furnitureIds: z.array(z.string().uuid()).optional(),
  roomType: roomTypeSchema.nullable().optional(),
  customRoom: z.string().max(200).nullable().optional(),
})

export const regenerateImageInputSchema = z.object({
  transformationType: z.string().min(1, 'Type de transformation requis'),
  customPrompt: z.string().max(5000).optional(),
  withFurniture: z.boolean().optional(),
  furnitureIds: z.array(z.string().uuid()).optional(),
  roomType: roomTypeSchema.optional(),
})

// ============================================
// TYPES INFÉRÉS
// ============================================

export type UploadImageInput = z.infer<typeof uploadImageInputSchema>
export type UpdateImageInput = z.infer<typeof updateImageInputSchema>
export type RegenerateImageInput = z.infer<typeof regenerateImageInputSchema>
