/**
 * Service : Gérer les styles personnalisés
 * Cas d'usage pour créer, modifier, supprimer des styles
 */

import type { IStylesRepository } from '../types'
import type {
  CustomStyle,
  CreateCustomStyleInput,
  UpdateCustomStyleInput,
} from '../types'
import {
  createCustomStyleInputSchema,
  updateCustomStyleInputSchema,
} from '../types'
import { generateStyleSlug } from '../utils/generate-slug'

export class ManageCustomStylesService {
  constructor(private readonly stylesRepository: IStylesRepository) {}

  /**
   * Créer un nouveau style personnalisé
   */
  async createCustomStyle(
    userId: string,
    input: CreateCustomStyleInput
  ): Promise<CustomStyle> {
    // 1. Valider l'input
    const validatedInput = createCustomStyleInputSchema.parse(input)

    // 2. Générer le slug
    const slug = generateStyleSlug(validatedInput.name)

    // 3. Créer le style
    return this.stylesRepository.createCustomStyle(userId, {
      ...validatedInput,
      iconName: validatedInput.iconName || 'Sparkles',
    })
  }

  /**
   * Mettre à jour un style personnalisé
   */
  async updateCustomStyle(
    userId: string,
    styleId: string,
    input: UpdateCustomStyleInput
  ): Promise<CustomStyle> {
    // 1. Valider l'input
    const validatedInput = updateCustomStyleInputSchema.parse(input)

    // 2. Mettre à jour
    return this.stylesRepository.updateCustomStyle(userId, styleId, validatedInput)
  }

  /**
   * Supprimer un style personnalisé
   */
  async deleteCustomStyle(userId: string, styleId: string): Promise<void> {
    return this.stylesRepository.deleteCustomStyle(userId, styleId)
  }

  /**
   * Récupérer tous les styles personnalisés d'un utilisateur
   */
  async getCustomStyles(userId: string): Promise<CustomStyle[]> {
    return this.stylesRepository.getCustomStyles(userId)
  }

  /**
   * Récupérer un style par ID
   */
  async getCustomStyleById(userId: string, styleId: string): Promise<CustomStyle | null> {
    return this.stylesRepository.getCustomStyleById(userId, styleId)
  }
}
