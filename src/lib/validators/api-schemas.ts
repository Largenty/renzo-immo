/**
 * Schémas de validation Zod pour les API routes
 * Protège contre les injections et valide les inputs utilisateur
 */

import { z } from 'zod'

// ============================================
// ENUMS & WHITELISTS
// ============================================

/**
 * Types de transformation autorisés (système)
 * Ces valeurs viennent de la base de données transformation_types
 */
const SYSTEM_TRANSFORMATION_TYPES = [
  'depersonnalisation',
  'depersonnalisation_premium',
  'home_staging_moderne',
  'home_staging_scandinave',
  'home_staging_industriel',
  'renovation_luxe',
  'renovation_contemporaine',
  'style_personnalise',
] as const

/**
 * Types de pièces autorisés
 * Whitelist des room_type acceptés par NanoBanana
 */
const ROOM_TYPES = [
  'salon',
  'cuisine',
  'chambre',
  'salle_de_bain',
  'salle_a_manger',
  'bureau',
  'entree',
  'couloir',
  'autre',
] as const

/**
 * Modes de meuble autorisés
 * Contrôle si l'IA doit ajouter/retirer des meubles
 */
const FURNITURE_MODES = ['auto', 'with', 'without'] as const

// ============================================
// SCHÉMAS ZOD
// ============================================

/**
 * Schéma pour transformation_type
 * Accepte les types système OU les types custom (pattern: custom_*)
 */
export const transformationTypeSchema = z.union([
  z.enum(SYSTEM_TRANSFORMATION_TYPES),
  z.string().regex(/^custom_[a-z0-9_]+$/, {
    message: 'Custom transformation type must match pattern: custom_[a-z0-9_]+',
  }),
])

/**
 * Schéma pour room_type
 * Accepte uniquement les types de pièces de la whitelist
 */
export const roomTypeSchema = z.enum(ROOM_TYPES).optional()

/**
 * Schéma pour furniture_mode
 * Accepte uniquement les 3 modes autorisés
 */
export const furnitureModeSchema = z.enum(FURNITURE_MODES)

/**
 * Schéma pour l'API /api/generate-image
 * Valide la requête POST pour générer une image
 */
export const generateImageRequestSchema = z.object({
  imageId: z.string().uuid({
    message: 'Image ID must be a valid UUID',
  }),
})

/**
 * Schéma pour l'API /api/check-generation-status
 * Valide la requête POST pour vérifier le statut
 */
export const checkStatusRequestSchema = z.object({
  imageId: z.string().uuid({
    message: 'Image ID must be a valid UUID',
  }),
})

/**
 * Schéma pour les paramètres RPC get_transformation_prompt
 * Valide les paramètres AVANT l'appel RPC
 */
export const rpcTransformationPromptSchema = z.object({
  p_transformation_type: transformationTypeSchema,
  p_room_type: roomTypeSchema,
  p_furniture_mode: furnitureModeSchema,
})

// ============================================
// TYPES TYPESCRIPT INFÉRÉS
// ============================================

export type TransformationType = z.infer<typeof transformationTypeSchema>
export type RoomType = z.infer<typeof roomTypeSchema>
export type FurnitureMode = z.infer<typeof furnitureModeSchema>
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>
export type CheckStatusRequest = z.infer<typeof checkStatusRequestSchema>
export type RpcTransformationPromptParams = z.infer<typeof rpcTransformationPromptSchema>

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Valide et parse de manière sécurisée un body de requête
 * Retourne soit les données validées, soit une erreur formatée
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details: string[] } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return {
      success: false,
      error: 'Invalid request data',
      details: ['Unknown validation error'],
    }
  }
}

/**
 * Valide que le transformation_type est dans la whitelist
 * Utilisé pour sécuriser les appels RPC
 */
export function isValidTransformationType(value: string): boolean {
  try {
    transformationTypeSchema.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * Valide que le room_type est dans la whitelist
 * Utilisé pour sécuriser les appels RPC
 */
export function isValidRoomType(value: string | null | undefined): boolean {
  if (!value) return true // room_type est optionnel
  try {
    roomTypeSchema.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * Valide que le furniture_mode est dans la whitelist
 * Utilisé pour sécuriser les appels RPC
 */
export function isValidFurnitureMode(value: string): boolean {
  try {
    furnitureModeSchema.parse(value)
    return true
  } catch {
    return false
  }
}
