/**
 * Modèle du domaine : Room (Pièce)
 */

import { z } from 'zod'

// ============================================
// TYPES
// ============================================

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

export interface RoomSpecification {
  id: string
  room_type: RoomType
  display_name_fr: string
  display_name_en: string
  constraints_text: string
  typical_area_min?: number
  typical_area_max?: number
  zones?: Record<string, string> | null
  description?: string
  icon_name?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  user_id?: string | null // NULL = pièce par défaut, string = pièce personnalisée
}

export interface CreateRoomInput {
  room_type: RoomType
  display_name_fr: string
  display_name_en: string
  constraints_text: string
  typical_area_min?: number
  typical_area_max?: number
  zones?: Record<string, string>
  description?: string
  icon_name?: string
}

export interface UpdateRoomInput {
  display_name_fr?: string
  display_name_en?: string
  constraints_text?: string
  typical_area_min?: number
  typical_area_max?: number
  zones?: Record<string, string> | null
  description?: string
  icon_name?: string
  is_active?: boolean
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

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

export const createRoomInputSchema = z.object({
  room_type: roomTypeSchema,
  display_name_fr: z.string().min(1, 'Nom français requis').max(100),
  display_name_en: z.string().min(1, 'Nom anglais requis').max(100),
  constraints_text: z.string().min(10, 'Les contraintes doivent contenir au moins 10 caractères'),
  typical_area_min: z.number().positive().optional().nullable(),
  typical_area_max: z.number().positive().optional().nullable(),
  zones: z.record(z.string(), z.string()).optional(),
  description: z.string().max(500).optional(),
  icon_name: z.string().max(50).optional(),
})

export const updateRoomInputSchema = z.object({
  display_name_fr: z.string().min(1).max(100).optional(),
  display_name_en: z.string().min(1).max(100).optional(),
  constraints_text: z.string().min(10).optional(),
  typical_area_min: z.number().positive().optional().nullable(),
  typical_area_max: z.number().positive().optional().nullable(),
  zones: z.record(z.string(), z.string()).nullable().optional(),
  description: z.string().max(500).optional(),
  icon_name: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
})

// ============================================
// CONSTANTES
// ============================================

export const ROOM_TYPE_LABELS: Record<RoomType, { fr: string; en: string; icon: string }> = {
  salon: { fr: 'Salon', en: 'Living Room', icon: 'Sofa' },
  chambre: { fr: 'Chambre', en: 'Bedroom', icon: 'BedDouble' },
  cuisine: { fr: 'Cuisine', en: 'Kitchen', icon: 'ChefHat' },
  salle_a_manger: { fr: 'Salle à manger', en: 'Dining Room', icon: 'Utensils' },
  salle_de_bain: { fr: 'Salle de bain', en: 'Bathroom', icon: 'ShowerHead' },
  wc: { fr: 'WC', en: 'Toilet', icon: 'Bath' },
  bureau: { fr: 'Bureau', en: 'Office', icon: 'Briefcase' },
  entree: { fr: 'Entrée', en: 'Entrance', icon: 'DoorOpen' },
  couloir: { fr: 'Couloir', en: 'Hallway', icon: 'ArrowRight' },
  terrasse: { fr: 'Terrasse', en: 'Terrace', icon: 'Sun' },
  balcon: { fr: 'Balcon', en: 'Balcony', icon: 'Home' },
  jardin: { fr: 'Jardin', en: 'Garden', icon: 'Trees' },
  garage: { fr: 'Garage', en: 'Garage', icon: 'Car' },
  cave: { fr: 'Cave', en: 'Cellar', icon: 'Wine' },
  grenier: { fr: 'Grenier', en: 'Attic', icon: 'Package' },
  buanderie: { fr: 'Buanderie', en: 'Laundry', icon: 'WashingMachine' },
  dressing: { fr: 'Dressing', en: 'Dressing Room', icon: 'Shirt' },
  veranda: { fr: 'Véranda', en: 'Veranda', icon: 'Flower2' },
  mezzanine: { fr: 'Mezzanine', en: 'Mezzanine', icon: 'Layers' },
  autre: { fr: 'Autre', en: 'Other', icon: 'HelpCircle' },
}
/**
 * Port: Interface du repository pour les pièces
 * Définit le contrat que l'infrastructure doit respecter
 */


export interface IRoomsRepository {
  /**
   * Récupère toutes les spécifications de pièces actives
   */
  findAll(): Promise<RoomSpecification[]>;

  /**
   * Récupère une spécification de pièce par son ID
   */
  findById(id: string): Promise<RoomSpecification | null>;

  /**
   * Récupère une spécification de pièce par son type
   */
  findByRoomType(roomType: RoomType): Promise<RoomSpecification | null>;

  /**
   * Crée une nouvelle spécification de pièce
   */
  create(data: CreateRoomInput): Promise<RoomSpecification>;

  /**
   * Met à jour une spécification de pièce existante
   */
  update(id: string, data: UpdateRoomInput): Promise<RoomSpecification>;

  /**
   * Supprime une spécification de pièce (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si une spécification de pièce existe
   */
  exists(id: string): Promise<boolean>;

  /**
   * Vérifie si un type de pièce existe déjà
   */
  existsByRoomType(roomType: RoomType): Promise<boolean>;
}
