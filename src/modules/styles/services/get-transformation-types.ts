/**
 * Service : Récupérer les types de transformation
 * Cas d'usage pour obtenir tous les styles disponibles (système + custom)
 */

import type { IStylesRepository } from '../types'
import type { CustomStyle, TransformationOption } from '../types'
import * as LucideIcons from 'lucide-react'
import { Sparkles } from 'lucide-react'

/**
 * Types de transformation par défaut (hardcodés)
 */
export const defaultTransformationTypes: TransformationOption[] = [
  {
    value: 'depersonnalisation',
    label: 'Dépersonnalisation',
    description: 'Pièce vide sans meubles ni objets de décoration',
    icon: LucideIcons.Home,
    allowFurnitureToggle: false,
  },
  {
    value: 'depersonnalisation_premium',
    label: 'Dépersonnalisation Premium',
    description: 'Pièce vide avec murs blancs et plancher de base',
    icon: LucideIcons.Sparkles,
    allowFurnitureToggle: false,
  },
  {
    value: 'home_staging_moderne',
    label: 'Home Staging Moderne',
    description: 'Mobilier contemporain épuré et design actuel',
    icon: LucideIcons.Palette,
    allowFurnitureToggle: true,
  },
  {
    value: 'home_staging_scandinave',
    label: 'Home Staging Scandinave',
    description: 'Ambiance nordique chaleureuse avec bois clair',
    icon: LucideIcons.Trees,
    allowFurnitureToggle: true,
  },
  {
    value: 'home_staging_industriel',
    label: 'Home Staging Industriel',
    description: 'Style loft urbain avec matériaux bruts',
    icon: LucideIcons.Cog,
    allowFurnitureToggle: true,
  },
  {
    value: 'renovation_luxe',
    label: 'Rénovation Luxe',
    description: 'Finitions haut de gamme et matériaux nobles',
    icon: LucideIcons.Gem,
    allowFurnitureToggle: true,
  },
  {
    value: 'renovation_contemporaine',
    label: 'Rénovation Contemporaine',
    description: 'Design élégant et tendances actuelles',
    icon: LucideIcons.Building2,
    allowFurnitureToggle: true,
  },
  {
    value: 'style_personnalise',
    label: 'Style Personnalisé',
    description: 'Décrivez votre propre vision avec vos mots',
    icon: LucideIcons.Wand2,
    allowFurnitureToggle: true,
  },
]

export class GetTransformationTypesService {
  constructor(private readonly stylesRepository: IStylesRepository) {}

  /**
   * Récupérer tous les types de transformation (système + custom)
   */
  async getAllTransformationTypes(userId: string): Promise<TransformationOption[]> {
    // 1. Récupérer TOUS les styles depuis la DB (système + custom)
    const dbStyles = await this.stylesRepository.getAllTransformationTypes(userId)

    // 2. Convertir en TransformationOption avec l'ID
    const allOptions = dbStyles.map(this.mapCustomStyleToOption)

    // 3. Retourner tous les styles (avec leurs UUIDs depuis la DB)
    return allOptions
  }

  /**
   * Récupérer uniquement les styles personnalisés
   */
  async getCustomStyles(userId: string): Promise<TransformationOption[]> {
    const customStyles = await this.stylesRepository.getCustomStyles(userId)
    return customStyles.map(this.mapCustomStyleToOption)
  }

  /**
   * Mapper CustomStyle → TransformationOption
   */
  private mapCustomStyleToOption(style: CustomStyle): TransformationOption {
    // Récupérer l'icône dynamiquement depuis Lucide
    const IconComponent =
      (LucideIcons as any)[style.iconName || 'Sparkles'] || Sparkles

    return {
      id: style.id, // ✅ AJOUTÉ: UUID du transformation_type
      value: style.slug as any, // Le slug (ex: "home_staging_moderne")
      label: style.name,
      description: style.description || '',
      icon: IconComponent,
      allowFurnitureToggle: style.allowFurnitureToggle,
      isCustom: !style.isSystem, // ✅ CORRIGÉ: true pour custom, false pour système
    }
  }
}
