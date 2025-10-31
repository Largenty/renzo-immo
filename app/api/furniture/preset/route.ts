import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/furniture/preset
 *
 * Récupère le preset de meubles par défaut pour un style et un type de room
 *
 * Query params:
 * - transformationTypeId: UUID du style (ex: home_staging_moderne)
 * - roomType: Type de room (ex: salon, chambre, cuisine...)
 *
 * Returns:
 * - furnitureIds: Array d'UUIDs des meubles du preset
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transformationTypeId = searchParams.get('transformationTypeId')
    const roomType = searchParams.get('roomType')

    if (!transformationTypeId || !roomType) {
      return NextResponse.json(
        { error: 'transformationTypeId and roomType are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 🔄 RÉSOLUTION SLUG → UUID
    // Si transformationTypeId est un slug, le résoudre en UUID
    let resolvedTransformationTypeId = transformationTypeId

    if (!transformationTypeId.includes('-')) {
      // C'est un slug, le résoudre
      const { data: transformationType } = await supabase
        .from('transformation_types')
        .select('id')
        .eq('slug', transformationTypeId)
        .single()

      if (transformationType) {
        resolvedTransformationTypeId = transformationType.id
        logger.debug('[Furniture Preset] Resolved slug to UUID', {
          slug: transformationTypeId,
          uuid: resolvedTransformationTypeId
        })
      } else {
        logger.error('[Furniture Preset] Failed to resolve slug', { slug: transformationTypeId })
        return NextResponse.json(
          { error: 'Invalid transformation type' },
          { status: 400 }
        )
      }
    }

    // Récupérer le preset par défaut (system preset)
    const { data: preset, error: presetError } = await supabase
      .from('room_furniture_presets')
      .select('furniture_ids, name_fr, name_en')
      .eq('transformation_type_id', resolvedTransformationTypeId)
      .eq('room_type', roomType)
      .eq('is_system', true)
      .single()

    if (presetError) {
      if (presetError.code === 'PGRST116') {
        // Aucun preset trouvé
        logger.info('No default preset found', {
          userId: user.id,
          transformationTypeId,
          roomType,
        })
        return NextResponse.json({
          furnitureIds: [],
          message: 'No default preset available for this combination',
        })
      }

      logger.error('Error fetching default preset', { error: presetError })
      return NextResponse.json(
        { error: 'Failed to fetch default preset' },
        { status: 500 }
      )
    }

    logger.info('✅ Default preset fetched', {
      userId: user.id,
      transformationTypeId,
      roomType,
      furnitureCount: preset.furniture_ids.length,
    })

    return NextResponse.json({
      furnitureIds: preset.furniture_ids,
      name: {
        fr: preset.name_fr,
        en: preset.name_en,
      },
    })

  } catch (error) {
    logger.error('Unexpected error in furniture preset endpoint', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
