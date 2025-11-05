import { z } from 'zod'

/**
 * Schema pour la création/édition d'une room specification (type de pièce)
 */
export const roomSpecificationSchema = z
  .object({
    roomType: z
      .string()
      .min(1, 'Le type de pièce est requis')
      .regex(/^[a-z_]+$/, 'Le type doit être en minuscules avec des underscores'),

    displayNameFr: z
      .string()
      .min(1, 'Le nom français est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

    displayNameEn: z
      .string()
      .min(1, 'Le nom anglais est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),

    constraintsText: z
      .string()
      .min(10, 'Les contraintes doivent contenir au moins 10 caractères')
      .max(2000, 'Les contraintes ne peuvent pas dépasser 2000 caractères'),

    typicalAreaMin: z
      .number()
      .min(0, 'La surface minimale doit être positive')
      .max(1000, 'La surface minimale ne peut pas dépasser 1000 m²')
      .optional()
      .nullable(),

    typicalAreaMax: z
      .number()
      .min(0, 'La surface maximale doit être positive')
      .max(1000, 'La surface maximale ne peut pas dépasser 1000 m²')
      .optional()
      .nullable(),

    description: z
      .string()
      .max(500, 'La description ne peut pas dépasser 500 caractères')
      .optional()
      .or(z.literal('')),

    iconName: z
      .string()
      .max(50, "Le nom de l'icône ne peut pas dépasser 50 caractères")
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.typicalAreaMin && data.typicalAreaMax) {
        return data.typicalAreaMin < data.typicalAreaMax
      }
      return true
    },
    {
      message: 'La surface minimale doit être inférieure à la surface maximale',
      path: ['typicalAreaMax'],
    }
  )

export type RoomSpecificationFormData = z.infer<typeof roomSpecificationSchema>
