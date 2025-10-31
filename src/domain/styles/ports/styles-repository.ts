/**
 * Port : Styles Repository
 * Interface abstraite pour accéder aux styles de transformation
 */

import type {
  CustomStyle,
  CreateCustomStyleInput,
  UpdateCustomStyleInput,
} from '../models/transformation-style'

export interface IStylesRepository {
  /**
   * Récupérer tous les styles personnalisés d'un utilisateur
   */
  getCustomStyles(userId: string): Promise<CustomStyle[]>

  /**
   * Récupérer un style personnalisé par ID
   */
  getCustomStyleById(userId: string, styleId: string): Promise<CustomStyle | null>

  /**
   * Récupérer tous les types de transformation (système + custom)
   */
  getAllTransformationTypes(userId: string): Promise<CustomStyle[]>

  /**
   * Créer un nouveau style personnalisé
   */
  createCustomStyle(userId: string, input: CreateCustomStyleInput): Promise<CustomStyle>

  /**
   * Mettre à jour un style personnalisé
   */
  updateCustomStyle(
    userId: string,
    styleId: string,
    input: UpdateCustomStyleInput
  ): Promise<CustomStyle>

  /**
   * Supprimer un style personnalisé
   */
  deleteCustomStyle(userId: string, styleId: string): Promise<void>
}
