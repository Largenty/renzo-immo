/**
 * Port: Interface du repository pour les pièces
 * Définit le contrat que l'infrastructure doit respecter
 */

import type { RoomSpecification, CreateRoomInput, UpdateRoomInput, RoomType } from '../models/room';

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
