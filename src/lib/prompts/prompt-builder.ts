/**
 * PromptBuilder - Modular Prompt Construction System
 *
 * Assemble des prompts dynamiquement à partir de:
 * - Style palette (couleurs, matériaux)
 * - Room specifications (contraintes architecturales)
 * - Furniture items (descriptions adaptées au style)
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  TEMPLATE_WITH_FURNITURE,
  TEMPLATE_WITHOUT_FURNITURE,
  TEMPLATE_FALLBACK,
  fillTemplate,
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
  furnitureIds?: string[];
  customPrompt?: string | null;
}

export interface PromptBuilderResult {
  prompt: string;
  source: 'custom' | 'modular' | 'fallback';
  metadata?: {
    style_name?: string;
    room_name?: string;
    furniture_count?: number;
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

interface FurnitureVariant {
  furniture_name_en: string;
  description: string;
  materials: string[];
  colors: string[];
  details: string | null;
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
    const { transformationTypeId, roomType, furnitureIds = [], customPrompt = null } = params;

    // 1. Si custom prompt fourni, l'utiliser directement
    if (customPrompt && customPrompt.trim().length > 0) {
      logger.info('[PromptBuilder] Using custom prompt', {
        transformationTypeId,
        promptLength: customPrompt.length,
      });

      return {
        prompt: customPrompt.trim(),
        source: 'custom',
      };
    }

    logger.debug('[PromptBuilder] Building modular prompt', {
      transformationTypeId,
      roomType,
      furnitureCount: furnitureIds.length,
    });

    try {
      // 🔄 RÉSOLUTION SLUG → UUID
      // Si transformationTypeId est un slug (string sans tirets), le résoudre en UUID
      const resolvedUUID = await this.resolveTransformationTypeId(transformationTypeId);

      if (!resolvedUUID) {
        logger.error('[PromptBuilder] Failed to resolve transformation type', {
          transformationTypeId,
        });
        return this.getFallbackPrompt(transformationTypeId);
      }

      logger.debug('[PromptBuilder] Resolved transformation type', {
        input: transformationTypeId,
        resolvedUUID,
      });

      // 2. Récupérer les composants du prompt
      const [stylePalette, roomSpec, furnitureVariants, transformationType] = await Promise.all([
        this.getStylePalette(resolvedUUID),
        this.getRoomSpec(roomType),
        furnitureIds.length > 0 ? this.getFurnitureVariants(resolvedUUID, furnitureIds) : Promise.resolve([]),
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
        furnitureVariants: furnitureVariants.map(f => f.furniture_name_en),
        transformationType: transformationType?.name,
      });

      // 3. Assembler le prompt
      const prompt = this.assemblePrompt({
        stylePalette,
        roomSpec,
        furnitureVariants,
        transformationTypeName: transformationType?.name || 'Unknown Style',
      });

      logger.info('[PromptBuilder] Modular prompt built successfully', {
        transformationTypeId,
        roomType,
        furnitureCount: furnitureVariants.length,
        promptLength: prompt.length,
      });

      return {
        prompt,
        source: 'modular',
        metadata: {
          style_name: transformationType?.name,
          room_name: roomSpec?.display_name_en,
          furniture_count: furnitureVariants.length,
        },
      };
    } catch (error) {
      logger.error('[PromptBuilder] Error building modular prompt', {
        error: error instanceof Error ? error.message : String(error),
        transformationTypeId,
        roomType,
      });

      // Fallback: essayer d'utiliser prompt_template
      return this.getFallbackPrompt(transformationTypeId);
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
   * Récupère les variantes de meubles pour ce style
   */
  private async getFurnitureVariants(
    transformationTypeId: string,
    furnitureIds: string[]
  ): Promise<FurnitureVariant[]> {
    if (furnitureIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from('style_furniture_variants')
      .select(`
        description,
        materials,
        colors,
        details,
        furniture:furniture_catalog!inner(name_en)
      `)
      .eq('transformation_type_id', transformationTypeId)
      .in('furniture_id', furnitureIds);

    if (error) {
      logger.warn('[PromptBuilder] Error fetching furniture variants', {
        error: error.message,
        transformationTypeId,
        furnitureIds,
      });
      return [];
    }

    // @ts-ignore - Supabase typing issue with joins
    return data.map((item: any) => ({
      furniture_name_en: item.furniture.name_en,
      description: item.description,
      materials: item.materials,
      colors: item.colors,
      details: item.details,
    }));
  }

  /**
   * Résout un slug ou UUID vers un UUID
   * Accepte soit un UUID (ex: "abc-123-def") soit un slug (ex: "home_staging_moderne")
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
   */
  private assemblePrompt(components: {
    stylePalette: StylePalette | null;
    roomSpec: RoomSpec | null;
    furnitureVariants: FurnitureVariant[];
    transformationTypeName: string;
  }): string {
    const { stylePalette, roomSpec, furnitureVariants, transformationTypeName } = components;

    // Préparer les variables pour le template
    const variables: Record<string, string> = {};

    // 1. Room constraints
    variables.room_constraints = roomSpec?.constraints_text || '';

    // 2. Style name
    variables.style_name = transformationTypeName;

    // 3. Style palette
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

    // 4. Furniture list
    const furnitureLines: string[] = [];
    furnitureVariants.forEach((variant, index) => {
      const details = variant.details ? ` (${variant.details})` : '';
      const materials = variant.materials?.length ? ` - Materials: ${variant.materials.join(', ')}` : '';
      const colors = variant.colors?.length ? ` - Colors: ${variant.colors.join(', ')}` : '';
      furnitureLines.push(`${index + 1}. ${variant.description}${details}${materials}${colors}`);
    });
    variables.furniture_list = furnitureLines.join('\n');

    // 5. Room name
    variables.room_name = roomSpec?.display_name_en || 'space';

    // 6. Final instruction
    const hasFurniture = furnitureVariants.length > 0;
    if (hasFurniture) {
      variables.final_instruction = `${transformationTypeName} ${variables.room_name.toLowerCase()} with specified furniture, maintaining original architecture.`;
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
  private async getFallbackPrompt(transformationTypeId: string): Promise<PromptBuilderResult> {
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
        prompt: this.getEmergencyFallbackPrompt(),
        source: 'fallback',
      };
    }

    return {
      prompt: data.prompt_template,
      source: 'fallback',
      metadata: {
        style_name: data.name,
      },
    };
  }

  /**
   * Emergency fallback générique
   */
  private getEmergencyFallbackPrompt(): string {
    return `Transform this interior space.
Keep the same room structure and layout (windows, doors, ceiling).
Create a clean, professional look suitable for real estate marketing.`;
  }
}

/**
 * Helper function pour utilisation simple
 */
export async function buildPrompt(params: PromptBuilderParams): Promise<PromptBuilderResult> {
  const builder = await PromptBuilder.create();
  return builder.build(params);
}

/**
 * Récupère le preset par défaut pour un style + room
 */
export async function getDefaultPreset(transformationTypeId: string, roomType: RoomType): Promise<string[] | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('room_furniture_presets')
    .select('furniture_ids')
    .eq('transformation_type_id', transformationTypeId)
    .eq('room_type', roomType)
    .eq('is_system', true)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    logger.debug('[PromptBuilder] No default preset found', {
      transformationTypeId,
      roomType,
    });
    return null;
  }

  return data.furniture_ids;
}
