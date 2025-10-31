/**
 * Port: Interface du repository pour les meubles
 * Définit le contrat que l'infrastructure doit respecter
 */

import type { FurnitureItem, CreateFurnitureInput, UpdateFurnitureInput } from '../models/furniture';

export interface IFurnitureRepository {
  /**
   * Récupère tous les meubles actifs
   */
  findAll(): Promise<FurnitureItem[]>;

  /**
   * Récupère un meuble par son ID
   */
  findById(id: string): Promise<FurnitureItem | null>;

  /**
   * Récupère les meubles par catégorie
   */
  findByCategory(category: string): Promise<FurnitureItem[]>;

  /**
   * Récupère les meubles compatibles avec un type de pièce
   */
  findByRoomType(roomType: string): Promise<FurnitureItem[]>;

  /**
   * Crée un nouveau meuble
   */
  create(data: CreateFurnitureInput): Promise<FurnitureItem>;

  /**
   * Met à jour un meuble existant
   */
  update(id: string, data: UpdateFurnitureInput): Promise<FurnitureItem>;

  /**
   * Supprime un meuble (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si un meuble existe
   */
  exists(id: string): Promise<boolean>;
}
