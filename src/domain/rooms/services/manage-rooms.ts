/**
 * Service: Gestion des pièces
 * Contient la logique métier pour les opérations CRUD sur les spécifications de pièces
 */

import type { IRoomsRepository } from '../ports/rooms-repository';
import type { RoomSpecification, CreateRoomInput, UpdateRoomInput, RoomType } from '../models/room';
import { validateRoom } from '../business-rules/validate-room';
import { logger } from '@/lib/logger';

export class ManageRoomsService {
  constructor(private repository: IRoomsRepository) {}

  /**
   * Liste toutes les spécifications de pièces actives
   */
  async listRooms(): Promise<RoomSpecification[]> {
    try {
      logger.debug('[ManageRoomsService] Listing all rooms');
      return await this.repository.findAll();
    } catch (error) {
      logger.error('[ManageRoomsService] Error listing rooms', { error });
      throw new Error('Impossible de récupérer la liste des pièces');
    }
  }

  /**
   * Récupère une spécification de pièce par son ID
   */
  async getRoom(id: string): Promise<RoomSpecification> {
    try {
      logger.debug('[ManageRoomsService] Getting room', { id });
      const room = await this.repository.findById(id);

      if (!room) {
        throw new Error('Spécification de pièce non trouvée');
      }

      return room;
    } catch (error) {
      logger.error('[ManageRoomsService] Error getting room', { id, error });
      throw error;
    }
  }

  /**
   * Récupère une spécification de pièce par son type
   */
  async getRoomByType(roomType: RoomType): Promise<RoomSpecification | null> {
    try {
      logger.debug('[ManageRoomsService] Getting room by type', { roomType });
      return await this.repository.findByRoomType(roomType);
    } catch (error) {
      logger.error('[ManageRoomsService] Error getting room by type', { roomType, error });
      throw new Error('Impossible de récupérer la spécification de pièce');
    }
  }

  /**
   * Crée une nouvelle spécification de pièce
   */
  async createRoom(data: CreateRoomInput): Promise<RoomSpecification> {
    try {
      logger.debug('[ManageRoomsService] Creating room', { data });

      // Vérifier si le type de pièce existe déjà
      const exists = await this.repository.existsByRoomType(data.room_type);
      if (exists) {
        throw new Error('Une spécification existe déjà pour ce type de pièce');
      }

      // Valider les règles métier
      const validationErrors = validateRoom(data);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Validation échouée: ${errorMessages}`);
      }

      // Créer la spécification de pièce
      const room = await this.repository.create(data);
      logger.info('[ManageRoomsService] Room created successfully', { id: room.id });

      return room;
    } catch (error) {
      logger.error('[ManageRoomsService] Error creating room', { error });
      throw error;
    }
  }

  /**
   * Met à jour une spécification de pièce existante
   */
  async updateRoom(id: string, data: UpdateRoomInput): Promise<RoomSpecification> {
    try {
      logger.debug('[ManageRoomsService] Updating room', { id, data });

      // Vérifier que la pièce existe
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new Error('Spécification de pièce non trouvée');
      }

      // Valider les règles métier si les champs critiques sont modifiés
      if (data.display_name_fr || data.display_name_en || data.constraints_text ||
          data.typical_area_min !== undefined || data.typical_area_max !== undefined ||
          data.zones !== undefined || data.description !== undefined) {

        const currentRoom = await this.repository.findById(id);
        if (currentRoom) {
          const roomToValidate = {
            room_type: currentRoom.room_type,
            display_name_fr: data.display_name_fr || currentRoom.display_name_fr,
            display_name_en: data.display_name_en || currentRoom.display_name_en,
            constraints_text: data.constraints_text || currentRoom.constraints_text,
            typical_area_min: data.typical_area_min !== undefined ? data.typical_area_min : currentRoom.typical_area_min,
            typical_area_max: data.typical_area_max !== undefined ? data.typical_area_max : currentRoom.typical_area_max,
            zones: data.zones !== undefined ? data.zones : currentRoom.zones,
            description: data.description !== undefined ? data.description : currentRoom.description,
          };

          const validationErrors = validateRoom(roomToValidate);
          if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
            throw new Error(`Validation échouée: ${errorMessages}`);
          }
        }
      }

      // Mettre à jour la spécification de pièce
      const room = await this.repository.update(id, data);
      logger.info('[ManageRoomsService] Room updated successfully', { id });

      return room;
    } catch (error) {
      logger.error('[ManageRoomsService] Error updating room', { id, error });
      throw error;
    }
  }

  /**
   * Supprime une spécification de pièce (soft delete)
   */
  async deleteRoom(id: string): Promise<void> {
    try {
      logger.debug('[ManageRoomsService] Deleting room', { id });

      // Vérifier que la pièce existe
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new Error('Spécification de pièce non trouvée');
      }

      // Supprimer la spécification de pièce
      await this.repository.delete(id);
      logger.info('[ManageRoomsService] Room deleted successfully', { id });
    } catch (error) {
      logger.error('[ManageRoomsService] Error deleting room', { id, error });
      throw error;
    }
  }
}
