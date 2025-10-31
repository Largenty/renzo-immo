/**
 * Service: Gestion des meubles
 * Contient la logique métier pour les opérations CRUD sur les meubles
 */

import type { IFurnitureRepository } from '../ports/furniture-repository';
import type { FurnitureItem, CreateFurnitureInput, UpdateFurnitureInput } from '../models/furniture';
import { validateFurniture } from '../business-rules/validate-furniture';
import { logger } from '@/lib/logger';

export class ManageFurnitureService {
  constructor(private repository: IFurnitureRepository) {}

  /**
   * Liste tous les meubles actifs
   */
  async listFurniture(): Promise<FurnitureItem[]> {
    try {
      logger.debug('[ManageFurnitureService] Listing all furniture');
      return await this.repository.findAll();
    } catch (error) {
      logger.error('[ManageFurnitureService] Error listing furniture', { error });
      throw new Error('Impossible de récupérer la liste des meubles');
    }
  }

  /**
   * Récupère un meuble par son ID
   */
  async getFurniture(id: string): Promise<FurnitureItem> {
    try {
      logger.debug('[ManageFurnitureService] Getting furniture', { id });
      const furniture = await this.repository.findById(id);

      if (!furniture) {
        throw new Error('Meuble non trouvé');
      }

      return furniture;
    } catch (error) {
      logger.error('[ManageFurnitureService] Error getting furniture', { id, error });
      throw error;
    }
  }

  /**
   * Récupère les meubles par catégorie
   */
  async getFurnitureByCategory(category: string): Promise<FurnitureItem[]> {
    try {
      logger.debug('[ManageFurnitureService] Getting furniture by category', { category });
      return await this.repository.findByCategory(category);
    } catch (error) {
      logger.error('[ManageFurnitureService] Error getting furniture by category', { category, error });
      throw new Error('Impossible de récupérer les meubles par catégorie');
    }
  }

  /**
   * Récupère les meubles compatibles avec un type de pièce
   */
  async getFurnitureByRoomType(roomType: string): Promise<FurnitureItem[]> {
    try {
      logger.debug('[ManageFurnitureService] Getting furniture by room type', { roomType });
      return await this.repository.findByRoomType(roomType);
    } catch (error) {
      logger.error('[ManageFurnitureService] Error getting furniture by room type', { roomType, error });
      throw new Error('Impossible de récupérer les meubles pour ce type de pièce');
    }
  }

  /**
   * Crée un nouveau meuble
   */
  async createFurniture(data: CreateFurnitureInput): Promise<FurnitureItem> {
    try {
      logger.debug('[ManageFurnitureService] Creating furniture', { data });

      // Valider les règles métier
      const validationErrors = validateFurniture(data);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Validation échouée: ${errorMessages}`);
      }

      // Créer le meuble
      const furniture = await this.repository.create(data);
      logger.info('[ManageFurnitureService] Furniture created successfully', { id: furniture.id });

      return furniture;
    } catch (error) {
      logger.error('[ManageFurnitureService] Error creating furniture', { error });
      throw error;
    }
  }

  /**
   * Met à jour un meuble existant
   */
  async updateFurniture(id: string, data: UpdateFurnitureInput): Promise<FurnitureItem> {
    try {
      logger.debug('[ManageFurnitureService] Updating furniture', { id, data });

      // Vérifier que le meuble existe
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new Error('Meuble non trouvé');
      }

      // Valider les règles métier si les champs critiques sont modifiés
      if (data.name_fr || data.name_en || data.room_types || data.typical_dimensions || data.priority !== undefined) {
        const currentFurniture = await this.repository.findById(id);
        if (currentFurniture) {
          const furnitureToValidate = {
            category: data.category || currentFurniture.category,
            room_types: data.room_types || currentFurniture.room_types,
            name_fr: data.name_fr || currentFurniture.name_fr,
            name_en: data.name_en || currentFurniture.name_en,
            typical_dimensions: data.typical_dimensions !== undefined ? data.typical_dimensions : currentFurniture.typical_dimensions,
            priority: data.priority !== undefined ? data.priority : currentFurniture.priority,
            generic_description: data.generic_description || currentFurniture.generic_description,
          };

          const validationErrors = validateFurniture(furnitureToValidate);
          if (validationErrors.length > 0) {
            const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
            throw new Error(`Validation échouée: ${errorMessages}`);
          }
        }
      }

      // Mettre à jour le meuble
      const furniture = await this.repository.update(id, data);
      logger.info('[ManageFurnitureService] Furniture updated successfully', { id });

      return furniture;
    } catch (error) {
      logger.error('[ManageFurnitureService] Error updating furniture', { id, error });
      throw error;
    }
  }

  /**
   * Supprime un meuble (soft delete)
   */
  async deleteFurniture(id: string): Promise<void> {
    try {
      logger.debug('[ManageFurnitureService] Deleting furniture', { id });

      // Vérifier que le meuble existe
      const exists = await this.repository.exists(id);
      if (!exists) {
        throw new Error('Meuble non trouvé');
      }

      // Supprimer le meuble
      await this.repository.delete(id);
      logger.info('[ManageFurnitureService] Furniture deleted successfully', { id });
    } catch (error) {
      logger.error('[ManageFurnitureService] Error deleting furniture', { id, error });
      throw error;
    }
  }
}
