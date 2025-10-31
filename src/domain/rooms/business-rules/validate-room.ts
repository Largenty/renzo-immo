/**
 * Business Rules: Validation des pièces
 */

import type { RoomType } from '../models/room';

export interface RoomValidationError {
  field: string;
  message: string;
}

/**
 * Valide qu'un nom est présent et non vide
 */
export function validateRoomName(name: string, language: 'fr' | 'en'): RoomValidationError | null {
  if (!name || name.trim().length === 0) {
    return {
      field: `display_name_${language}`,
      message: `Le nom en ${language === 'fr' ? 'français' : 'anglais'} est requis`,
    };
  }

  if (name.length > 100) {
    return {
      field: `display_name_${language}`,
      message: `Le nom ne peut pas dépasser 100 caractères`,
    };
  }

  return null;
}

/**
 * Valide que les contraintes architecturales sont présentes
 */
export function validateConstraints(constraints: string): RoomValidationError | null {
  if (!constraints || constraints.trim().length === 0) {
    return {
      field: 'constraints_text',
      message: 'Les contraintes architecturales sont requises',
    };
  }

  if (constraints.length < 10) {
    return {
      field: 'constraints_text',
      message: 'Les contraintes doivent contenir au moins 10 caractères',
    };
  }

  if (constraints.length > 1000) {
    return {
      field: 'constraints_text',
      message: 'Les contraintes ne peuvent pas dépasser 1000 caractères',
    };
  }

  return null;
}

/**
 * Valide les surfaces typiques d'une pièce
 */
export function validateTypicalAreas(
  areaMin?: number,
  areaMax?: number
): RoomValidationError | null {
  if (areaMin !== undefined && areaMin <= 0) {
    return {
      field: 'typical_area_min',
      message: 'La surface minimale doit être supérieure à 0',
    };
  }

  if (areaMax !== undefined && areaMax <= 0) {
    return {
      field: 'typical_area_max',
      message: 'La surface maximale doit être supérieure à 0',
    };
  }

  if (areaMin !== undefined && areaMax !== undefined && areaMin > areaMax) {
    return {
      field: 'typical_area_min',
      message: 'La surface minimale ne peut pas être supérieure à la surface maximale',
    };
  }

  // Vérifier des surfaces réalistes (max 500m²)
  if (areaMax && areaMax > 500) {
    return {
      field: 'typical_area_max',
      message: 'La surface maximale ne peut pas dépasser 500m²',
    };
  }

  return null;
}

/**
 * Valide la description d'une pièce
 */
export function validateDescription(description?: string): RoomValidationError | null {
  if (description && description.length > 500) {
    return {
      field: 'description',
      message: 'La description ne peut pas dépasser 500 caractères',
    };
  }

  return null;
}

/**
 * Valide les zones d'une pièce
 */
export function validateZones(zones?: Record<string, string>): RoomValidationError | null {
  if (!zones) return null;

  const zoneKeys = Object.keys(zones);
  if (zoneKeys.length > 20) {
    return {
      field: 'zones',
      message: 'Une pièce ne peut pas avoir plus de 20 zones',
    };
  }

  for (const [key, value] of Object.entries(zones)) {
    if (key.length > 50) {
      return {
        field: 'zones',
        message: `Le nom de zone "${key}" est trop long (max 50 caractères)`,
      };
    }

    if (value.length > 200) {
      return {
        field: 'zones',
        message: `La description de la zone "${key}" est trop longue (max 200 caractères)`,
      };
    }
  }

  return null;
}

/**
 * Valide toutes les règles métier d'une pièce
 */
export function validateRoom(data: {
  room_type: RoomType;
  display_name_fr: string;
  display_name_en: string;
  constraints_text: string;
  typical_area_min?: number;
  typical_area_max?: number;
  zones?: Record<string, string>;
  description?: string;
}): RoomValidationError[] {
  const errors: RoomValidationError[] = [];

  // Valider les noms
  const nameFrError = validateRoomName(data.display_name_fr, 'fr');
  if (nameFrError) errors.push(nameFrError);

  const nameEnError = validateRoomName(data.display_name_en, 'en');
  if (nameEnError) errors.push(nameEnError);

  // Valider les contraintes
  const constraintsError = validateConstraints(data.constraints_text);
  if (constraintsError) errors.push(constraintsError);

  // Valider les surfaces
  const areasError = validateTypicalAreas(data.typical_area_min, data.typical_area_max);
  if (areasError) errors.push(areasError);

  // Valider la description
  const descriptionError = validateDescription(data.description);
  if (descriptionError) errors.push(descriptionError);

  // Valider les zones
  const zonesError = validateZones(data.zones);
  if (zonesError) errors.push(zonesError);

  return errors;
}
