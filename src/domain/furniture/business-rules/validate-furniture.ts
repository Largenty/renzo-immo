/**
 * Business Rules: Validation des meubles
 */

import type { FurnitureCategory, RoomType } from '../models/furniture';

export interface FurnitureValidationError {
  field: string;
  message: string;
}

/**
 * Valide qu'un meuble a au moins un type de pièce associé
 */
export function validateRoomTypes(roomTypes: RoomType[]): FurnitureValidationError | null {
  if (!roomTypes || roomTypes.length === 0) {
    return {
      field: 'room_types',
      message: 'Un meuble doit être associé à au moins un type de pièce',
    };
  }
  return null;
}

/**
 * Valide que les dimensions sont cohérentes
 */
export function validateDimensions(dimensions?: {
  width?: number;
  depth?: number;
  height?: number;
}): FurnitureValidationError | null {
  if (!dimensions) return null;

  const { width, depth, height } = dimensions;

  if (width && width <= 0) {
    return {
      field: 'typical_dimensions.width',
      message: 'La largeur doit être supérieure à 0',
    };
  }

  if (depth && depth <= 0) {
    return {
      field: 'typical_dimensions.depth',
      message: 'La profondeur doit être supérieure à 0',
    };
  }

  if (height && height <= 0) {
    return {
      field: 'typical_dimensions.height',
      message: 'La hauteur doit être supérieure à 0',
    };
  }

  // Vérifier des dimensions réalistes (max 10m)
  if (width && width > 1000) {
    return {
      field: 'typical_dimensions.width',
      message: 'La largeur ne peut pas dépasser 10m (1000cm)',
    };
  }

  if (depth && depth > 1000) {
    return {
      field: 'typical_dimensions.depth',
      message: 'La profondeur ne peut pas dépasser 10m (1000cm)',
    };
  }

  if (height && height > 500) {
    return {
      field: 'typical_dimensions.height',
      message: 'La hauteur ne peut pas dépasser 5m (500cm)',
    };
  }

  return null;
}

/**
 * Valide la priorité d'un meuble
 */
export function validatePriority(priority: number): FurnitureValidationError | null {
  if (priority < 0 || priority > 1000) {
    return {
      field: 'priority',
      message: 'La priorité doit être entre 0 et 1000',
    };
  }
  return null;
}

/**
 * Valide qu'un nom est présent et non vide
 */
export function validateName(name: string, language: 'fr' | 'en'): FurnitureValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: `name_${language}`,
      message: `Le nom en ${language === 'fr' ? 'français' : 'anglais'} est requis`,
    };
  }

  if (name.length > 100) {
    return {
      field: `name_${language}`,
      message: `Le nom ne peut pas dépasser 100 caractères`,
    };
  }

  return null;
}

/**
 * Valide toutes les règles métier d'un meuble
 */
export function validateFurniture(data: {
  category: FurnitureCategory;
  room_types: RoomType[];
  name_fr: string;
  name_en: string;
  typical_dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
  };
  priority?: number;
  generic_description?: string;
}): FurnitureValidationError[] {
  const errors: FurnitureValidationError[] = [];

  // Valider les noms
  const nameFrError = validateName(data.name_fr, 'fr');
  if (nameFrError) errors.push(nameFrError);

  const nameEnError = validateName(data.name_en, 'en');
  if (nameEnError) errors.push(nameEnError);

  // Valider les types de pièces
  const roomTypesError = validateRoomTypes(data.room_types);
  if (roomTypesError) errors.push(roomTypesError);

  // Valider les dimensions
  const dimensionsError = validateDimensions(data.typical_dimensions);
  if (dimensionsError) errors.push(dimensionsError);

  // Valider la priorité
  if (data.priority !== undefined) {
    const priorityError = validatePriority(data.priority);
    if (priorityError) errors.push(priorityError);
  }

  // Valider la description
  if (data.generic_description && data.generic_description.length > 500) {
    errors.push({
      field: 'generic_description',
      message: 'La description ne peut pas dépasser 500 caractères',
    });
  }

  return errors;
}
