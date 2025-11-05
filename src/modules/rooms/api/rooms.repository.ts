/**
 * Repository: RoomsRepository
 * Gestion des spécifications de pièces (room_specifications)
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  RoomSpecification,
  CreateRoomInput,
  UpdateRoomInput,
  RoomType,
  IRoomsRepository,
} from '../types'

export class RoomsRepository implements IRoomsRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Récupère toutes les spécifications de pièces actives pour un utilisateur
   * (pièces par défaut + pièces personnalisées de l'utilisateur)
   */
  async findAllForUser(userId: string): Promise<RoomSpecification[]> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .select('*')
      .eq('is_active', true)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('room_type', { ascending: true })

    if (error) {
      throw new Error(`Erreur lors de la récupération des pièces: ${error.message}`)
    }

    return (data || []).map(this.mapToRoomSpecification)
  }

  /**
   * Récupère toutes les spécifications de pièces actives
   */
  async findAll(): Promise<RoomSpecification[]> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .select('*')
      .eq('is_active', true)
      .order('room_type', { ascending: true })

    if (error) {
      throw new Error(`Erreur lors de la récupération des pièces: ${error.message}`)
    }

    return (data || []).map(this.mapToRoomSpecification)
  }

  /**
   * Récupère une spécification de pièce par son ID
   */
  async findById(id: string): Promise<RoomSpecification | null> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Erreur lors de la récupération de la pièce: ${error.message}`)
    }

    return this.mapToRoomSpecification(data)
  }

  /**
   * Récupère une spécification de pièce par son type
   */
  async findByRoomType(roomType: RoomType): Promise<RoomSpecification | null> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .select('*')
      .eq('room_type', roomType)
      .eq('is_active', true)
      .is('user_id', null) // Seulement les pièces par défaut
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Erreur lors de la récupération de la pièce: ${error.message}`)
    }

    return this.mapToRoomSpecification(data)
  }

  /**
   * Crée une nouvelle spécification de pièce par défaut (user_id = null)
   */
  async createDefaultRoom(input: CreateRoomInput): Promise<RoomSpecification> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .insert({
        ...input,
        user_id: null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erreur lors de la création de la pièce par défaut: ${error.message}`)
    }

    return this.mapToRoomSpecification(data)
  }

  /**
   * Crée une nouvelle spécification de pièce personnalisée pour un utilisateur
   */
  async createUserRoom(userId: string, input: CreateRoomInput): Promise<RoomSpecification> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .insert({
        ...input,
        user_id: userId,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erreur lors de la création de la pièce personnalisée: ${error.message}`)
    }

    return this.mapToRoomSpecification(data)
  }

  /**
   * Crée une nouvelle spécification de pièce (alias pour create)
   */
  async create(data: CreateRoomInput): Promise<RoomSpecification> {
    return this.createDefaultRoom(data)
  }

  /**
   * Met à jour une spécification de pièce existante
   */
  async update(id: string, input: UpdateRoomInput): Promise<RoomSpecification> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la pièce: ${error.message}`)
    }

    return this.mapToRoomSpecification(data)
  }

  /**
   * Supprime une spécification de pièce (soft delete)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('room_specifications')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      throw new Error(`Erreur lors de la suppression de la pièce: ${error.message}`)
    }
  }

  /**
   * Vérifie si une spécification de pièce existe
   */
  async exists(id: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('room_specifications')
      .select('id', { count: 'exact', head: true })
      .eq('id', id)

    if (error) {
      throw new Error(`Erreur lors de la vérification de l'existence de la pièce: ${error.message}`)
    }

    return (count || 0) > 0
  }

  /**
   * Vérifie si un type de pièce existe déjà
   */
  async existsByRoomType(roomType: RoomType): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('room_specifications')
      .select('id', { count: 'exact', head: true })
      .eq('room_type', roomType)
      .is('user_id', null)

    if (error) {
      throw new Error(`Erreur lors de la vérification de l'existence du type de pièce: ${error.message}`)
    }

    return (count || 0) > 0
  }

  /**
   * Mapper les données de Supabase vers le modèle RoomSpecification
   */
  private mapToRoomSpecification(data: any): RoomSpecification {
    return {
      id: data.id,
      room_type: data.room_type,
      display_name_fr: data.display_name_fr,
      display_name_en: data.display_name_en,
      constraints_text: data.constraints_text,
      typical_area_min: data.typical_area_min,
      typical_area_max: data.typical_area_max,
      zones: data.zones,
      description: data.description,
      icon_name: data.icon_name,
      is_active: data.is_active,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      user_id: data.user_id,
    }
  }
}
