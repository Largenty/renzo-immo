import {
  Home,
  Palette,
  Trees,
  Cog,
  Gem,
  Building2,
  Wand2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { TransformationType, CustomStyle } from "@/types/dashboard";
import * as LucideIcons from "lucide-react";

export interface TransformationOption {
  value: TransformationType;
  label: string;
  description: string;
  icon: LucideIcon;
  allowFurnitureToggle?: boolean;
  isCustom?: boolean;
}

// Types de transformation par défaut
export const defaultTransformationTypes: TransformationOption[] = [
  {
    value: "depersonnalisation",
    label: "Dépersonnalisation",
    description: "Pièce vide sans meubles ni objets de décoration",
    icon: Home,
    allowFurnitureToggle: false,
  },
  {
    value: "depersonnalisation_premium",
    label: "Dépersonnalisation Premium",
    description: "Pièce vide avec murs blancs et plancher de base",
    icon: Sparkles,
    allowFurnitureToggle: false,
  },
  {
    value: "home_staging_moderne",
    label: "Home Staging Moderne",
    description: "Mobilier contemporain épuré et design actuel",
    icon: Palette,
    allowFurnitureToggle: true,
  },
  {
    value: "home_staging_scandinave",
    label: "Home Staging Scandinave",
    description: "Ambiance nordique chaleureuse avec bois clair",
    icon: Trees,
    allowFurnitureToggle: true,
  },
  {
    value: "home_staging_industriel",
    label: "Home Staging Industriel",
    description: "Style loft urbain avec matériaux bruts",
    icon: Cog,
    allowFurnitureToggle: true,
  },
  {
    value: "renovation_luxe",
    label: "Rénovation Luxe",
    description: "Finitions haut de gamme et matériaux nobles",
    icon: Gem,
    allowFurnitureToggle: true,
  },
  {
    value: "renovation_contemporaine",
    label: "Rénovation Contemporaine",
    description: "Design élégant et tendances actuelles",
    icon: Building2,
    allowFurnitureToggle: true,
  },
  {
    value: "style_personnalise",
    label: "Style Personnalisé",
    description: "Décrivez votre propre vision avec vos mots",
    icon: Wand2,
    allowFurnitureToggle: true,
  },
];

// Convertir un CustomStyle en TransformationOption
export function customStyleToTransformationOption(
  style: CustomStyle
): TransformationOption {
  // Récupérer l'icône dynamiquement
  const IconComponent = (LucideIcons as any)[style.iconName] || Home;

  return {
    value: `custom_${style.id}` as TransformationType,
    label: style.name,
    description: style.description,
    icon: IconComponent,
    allowFurnitureToggle: true,
    isCustom: true,
  };
}

// Obtenir tous les types de transformation (built-in + personnalisés)
export function getAllTransformationTypes(
  customStyles: CustomStyle[]
): TransformationOption[] {
  const customOptions = customStyles.map(customStyleToTransformationOption);
  return [...defaultTransformationTypes, ...customOptions];
}

// Dictionnaire des labels
export function getTransformationLabel(
  type: TransformationType,
  customStyles: CustomStyle[]
): string {
  // Si c'est un style personnalisé (commence par "custom_")
  if (typeof type === "string" && type.startsWith("custom_")) {
    const styleId = type.replace("custom_", "");
    const customStyle = customStyles.find((s) => s.id === styleId);
    if (customStyle) return customStyle.name;
  }

  // Sinon chercher dans les types par défaut
  const defaultType = defaultTransformationTypes.find((t) => t.value === type);
  return defaultType?.label || type;
}
