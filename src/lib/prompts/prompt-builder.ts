/**
 * PromptBuilder - Modular Prompt Construction System
 * SIMPLIFIÉ: Sans gestion détaillée des meubles
 *
 * Assemble des prompts dynamiquement à partir de:
 * - Style palette (couleurs, matériaux)
 * - Room specifications (contraintes architecturales)
 * - Flag withFurniture (simple boolean)
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  TEMPLATE_WITH_FURNITURE,
  TEMPLATE_WITHOUT_FURNITURE,
  TEMPLATE_FALLBACK,
  fillTemplate,
  getNegativePrompt,
  NEGATIVE_PROMPT_FALLBACK,
} from './prompt-templates';

// Types
export type RoomType =
  | 'salon'
  | 'chambre'
  | 'cuisine'
  | 'salle_a_manger'
  | 'salle_de_bain'
  | 'wc'
  | 'bureau'
  | 'entree'
  | 'couloir'
  | 'terrasse'
  | 'balcon'
  | 'jardin'
  | 'garage'
  | 'cave'
  | 'grenier'
  | 'buanderie'
  | 'dressing'
  | 'veranda'
  | 'mezzanine'
  | 'autre';

export interface PromptBuilderParams {
  transformationTypeId: string;
  roomType: RoomType;
  withFurniture?: boolean;  // Toggle: true = with furniture, false = without furniture
  customPrompt?: string | null;
  roomWidth?: number;  // Largeur de la pièce en mètres (optionnel mais recommandé)
  roomLength?: number; // Longueur de la pièce en mètres (optionnel mais recommandé)
  roomArea?: number;   // Surface en m² (optionnel, calculé si width/length fournis)
}

export interface PromptBuilderResult {
  prompt: string;
  negativePrompt: string;
  source: 'custom' | 'modular' | 'fallback';
  metadata?: {
    style_name?: string;
    room_name?: string;
    with_furniture?: boolean;
  };
}

interface StylePalette {
  wall_colors: string[];
  floor_materials: string[];
  accent_colors: string[];
  materials: string[];
  finishes: string[];
  ambiance_keywords: string[];
  lighting_style: string | null;
  general_instructions: string | null;
}

interface RoomSpec {
  display_name_fr: string;
  display_name_en: string;
  constraints_text: string;
  zones: Record<string, string> | null;
}

/**
 * Classe principale de construction de prompts modulaires
 */
export class PromptBuilder {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  private constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  /**
   * Factory method pour créer une instance
   */
  static async create(): Promise<PromptBuilder> {
    const supabase = await createClient();
    return new PromptBuilder(supabase);
  }

  /**
   * Construit le prompt final
   */
  async build(params: PromptBuilderParams): Promise<PromptBuilderResult> {
    const { transformationTypeId, roomType, withFurniture = true, customPrompt = null, roomWidth, roomLength, roomArea } = params;

    // 🪑 FURNITURE: Use the provided flag (defaults to true if not specified)

    // 1. Si custom prompt fourni, l'utiliser directement
    if (customPrompt && customPrompt.trim().length > 0) {
      logger.info('[PromptBuilder] Using custom prompt', {
        transformationTypeId,
        promptLength: customPrompt.length,
      });

      return {
        prompt: customPrompt.trim(),
        negativePrompt: getNegativePrompt(withFurniture),
        source: 'custom',
      };
    }

    logger.debug('[PromptBuilder] Building modular prompt', {
      transformationTypeId,
      roomType,
      withFurniture,
    });

    try {
      // 🔄 RÉSOLUTION SLUG → UUID
      const resolvedUUID = await this.resolveTransformationTypeId(transformationTypeId);

      if (!resolvedUUID) {
        logger.error('[PromptBuilder] Failed to resolve transformation type', {
          transformationTypeId,
        });
        return this.getFallbackPrompt(transformationTypeId, withFurniture);
      }

      logger.debug('[PromptBuilder] Resolved transformation type', {
        input: transformationTypeId,
        resolvedUUID,
      });

      // 2. Récupérer les composants du prompt (SIMPLIFIÉ - sans meubles)
      const [stylePalette, roomSpec, transformationType] = await Promise.all([
        this.getStylePalette(resolvedUUID),
        this.getRoomSpec(roomType),
        this.getTransformationType(resolvedUUID),
      ]);

      // 🐛 DEBUG: Log des composants récupérés
      logger.info('========== PROMPT COMPONENTS ==========', {
        stylePalette: stylePalette ? {
          wall_colors: stylePalette.wall_colors,
          floor_materials: stylePalette.floor_materials,
          accent_colors: stylePalette.accent_colors,
          hasData: true,
        } : null,
        roomSpec: roomSpec ? {
          display_name: roomSpec.display_name_fr,
          hasConstraints: !!roomSpec.constraints_text,
        } : null,
        withFurniture,
        transformationType: transformationType?.name,
      });

      // 3. Assembler le prompt
      const prompt = this.assemblePrompt({
        stylePalette,
        roomSpec,
        hasFurniture: withFurniture,
        transformationTypeName: transformationType?.name || 'Unknown Style',
        roomWidth,
        roomLength,
        roomArea,
      });

      const negativePrompt = getNegativePrompt(withFurniture);

      logger.info('[PromptBuilder] Modular prompt built successfully', {
        transformationTypeId,
        roomType,
        withFurniture,
        promptLength: prompt.length,
        negativePromptLength: negativePrompt.length,
      });

      return {
        prompt,
        negativePrompt,
        source: 'modular',
        metadata: {
          style_name: transformationType?.name,
          room_name: roomSpec?.display_name_en,
          with_furniture: withFurniture,
        },
      };
    } catch (error) {
      logger.error('[PromptBuilder] Error building modular prompt', {
        error: error instanceof Error ? error.message : String(error),
        transformationTypeId,
        roomType,
      });

      // Fallback: essayer d'utiliser prompt_template
      return this.getFallbackPrompt(transformationTypeId, withFurniture);
    }
  }

  /**
   * Récupère la palette de style
   */
  private async getStylePalette(transformationTypeId: string): Promise<StylePalette | null> {
    const { data, error } = await this.supabase
      .from('style_palettes')
      .select('*')
      .eq('transformation_type_id', transformationTypeId)
      .single();

    if (error) {
      logger.warn('[PromptBuilder] No style palette found', {
        transformationTypeId,
        error: error.message,
      });
      return null;
    }

    return data;
  }

  /**
   * Récupère les spécifications de la pièce
   */
  private async getRoomSpec(roomType: RoomType): Promise<RoomSpec | null> {
    const { data, error } = await this.supabase
      .from('room_specifications')
      .select('display_name_fr, display_name_en, constraints_text, zones')
      .eq('room_type', roomType)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.warn('[PromptBuilder] No room spec found', {
        roomType,
        error: error.message,
      });
      return null;
    }

    return data;
  }

  /**
   * Résout un slug ou UUID vers un UUID
   */
  private async resolveTransformationTypeId(input: string): Promise<string | null> {
    // Si c'est déjà un UUID (contient des tirets), le retourner tel quel
    if (input.includes('-')) {
      logger.debug('[PromptBuilder] Input is already a UUID', { input });
      return input;
    }

    // Sinon, c'est un slug → résoudre en UUID
    logger.debug('[PromptBuilder] Resolving slug to UUID', { slug: input });

    const { data, error } = await this.supabase
      .from('transformation_types')
      .select('id')
      .eq('slug', input)
      .single();

    if (error || !data) {
      logger.error('[PromptBuilder] Failed to resolve slug', {
        slug: input,
        error: error?.message,
      });
      return null;
    }

    return data.id;
  }

  /**
   * Récupère le type de transformation
   */
  private async getTransformationType(transformationTypeId: string) {
    const { data } = await this.supabase
      .from('transformation_types')
      .select('name, slug')
      .eq('id', transformationTypeId)
      .single();

    return data;
  }

  /**
   * Assemble le prompt final à partir des composants en utilisant les templates
   * SIMPLIFIÉ: Ne liste plus les meubles, juste un flag
   */
  private assemblePrompt(components: {
    stylePalette: StylePalette | null;
    roomSpec: RoomSpec | null;
    hasFurniture: boolean;
    transformationTypeName: string;
    roomWidth?: number;
    roomLength?: number;
    roomArea?: number;
  }): string {
    const { stylePalette, roomSpec, hasFurniture, transformationTypeName, roomWidth, roomLength, roomArea } = components;

    // Préparer les variables pour le template
    const variables: Record<string, string> = {};

    // 1. Room dimensions (NEW - highest priority constraint)
    const dimensionParts: string[] = [];
    if (roomWidth && roomLength) {
      dimensionParts.push(`${roomWidth}m x ${roomLength}m`);
      // Calculate area if not provided
      const calculatedArea = roomArea || (roomWidth * roomLength);
      dimensionParts.push(`(${calculatedArea.toFixed(1)}m²)`);
    } else if (roomArea) {
      dimensionParts.push(`${roomArea}m²`);
    }

    if (dimensionParts.length > 0) {
      variables.room_dimensions = `\n⚠️ EXACT ROOM DIMENSIONS - MUST PRESERVE (weight: 3.5) ⚠️\nThis room measures: ${dimensionParts.join(' ')}\n• These dimensions are FIXED and CANNOT change\n• Transform style/colors/furniture BUT keep these exact measurements\n• Width and length LOCKED to these values\n• Total area MUST remain ${dimensionParts[dimensionParts.length - 1]}\n`;
    } else {
      variables.room_dimensions = '';
    }

    // 2. Room constraints
    variables.room_constraints = roomSpec?.constraints_text || '';

    // 3. Style name
    variables.style_name = transformationTypeName;

    // 4. Style palette
    const paletteLines: string[] = [];
    if (stylePalette) {
      if (stylePalette.wall_colors && stylePalette.wall_colors.length > 0) {
        paletteLines.push(`• Walls: ${stylePalette.wall_colors.join(' OR ')}`);
      }
      if (stylePalette.floor_materials && stylePalette.floor_materials.length > 0) {
        paletteLines.push(`• Floor: ${stylePalette.floor_materials.join(' OR ')}`);
      }
      if (stylePalette.accent_colors && stylePalette.accent_colors.length > 0) {
        paletteLines.push(`• Accent colors: ${stylePalette.accent_colors.join(', ')}`);
      }
      if (stylePalette.ambiance_keywords && stylePalette.ambiance_keywords.length > 0) {
        paletteLines.push(`• Ambiance: ${stylePalette.ambiance_keywords.join(', ')}`);
      }
      if (stylePalette.lighting_style) {
        paletteLines.push(`• Lighting: ${stylePalette.lighting_style}`);
      }
      if (stylePalette.general_instructions) {
        paletteLines.push(`\n${stylePalette.general_instructions}`);
      }
    }
    variables.style_palette = paletteLines.join('\n');

    // 5. Room name
    variables.room_name = roomSpec?.display_name_en || 'space';

    // 6. Final instruction
    if (hasFurniture) {
      variables.final_instruction = `${transformationTypeName} ${variables.room_name.toLowerCase()} with appropriate furniture, maintaining original architecture.`;
    } else {
      variables.final_instruction = `Empty ${variables.room_name.toLowerCase()} with original walls, floors, and architecture UNCHANGED.`;
    }

    // 7. Furniture instruction (pour fallback)
    variables.furniture_instruction = hasFurniture
      ? 'Add modern, stylish furniture appropriate for the space.'
      : 'Remove all furniture and personal items. Empty room.';

    // Choisir le template approprié
    const template = hasFurniture
      ? TEMPLATE_WITH_FURNITURE
      : TEMPLATE_WITHOUT_FURNITURE;

    return fillTemplate(template, variables);
  }

  /**
   * Fallback si le système modulaire échoue
   */
  private async getFallbackPrompt(transformationTypeId: string, withFurniture: boolean): Promise<PromptBuilderResult> {
    logger.debug('[PromptBuilder] Using fallback prompt_template', {
      transformationTypeId,
    });

    const { data, error } = await this.supabase
      .from('transformation_types')
      .select('prompt_template, name')
      .eq('id', transformationTypeId)
      .single();

    if (error || !data?.prompt_template) {
      logger.error('[PromptBuilder] No fallback prompt available', {
        error: error?.message,
        transformationTypeId,
      });

      return {
        prompt: this.getEmergencyFallbackPrompt(withFurniture),
        negativePrompt: NEGATIVE_PROMPT_FALLBACK,
        source: 'fallback',
      };
    }

    return {
      prompt: data.prompt_template,
      negativePrompt: NEGATIVE_PROMPT_FALLBACK,
      source: 'fallback',
      metadata: {
        style_name: data.name,
        with_furniture: withFurniture,
      },
    };
  }

  /**
   * Emergency fallback générique
   */
  private getEmergencyFallbackPrompt(withFurniture: boolean): string {
    const furnitureInstruction = withFurniture
      ? 'Add appropriate furniture for the space.'
      : '';

    return `Transform this interior space.
Keep the same room structure and layout (windows, doors, ceiling).
Create a clean, professional look suitable for real estate marketing.
${furnitureInstruction}`;
  }
}

/**
 * Helper function pour utilisation simple
 */
export async function buildPrompt(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  const builder = await PromptBuilder.create();
  return builder.build(params);
}
