import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/furniture/catalog
 *
 * Récupère le catalogue de meubles disponibles pour un style et un type de room
 *
 * Query params:
 * - transformationTypeId: UUID du style (ex: home_staging_moderne)
 * - roomType: Type de room (ex: salon, chambre, cuisine...)
 *
 * Returns:
 * - furniture: Array de meubles avec leurs variantes pour le style demandé
 * - preset: IDs des meubles du preset par défaut (si disponible)
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
        logger.debug('[Furniture Catalog] Resolved slug to UUID', {
          slug: transformationTypeId,
          uuid: resolvedTransformationTypeId
        })
      } else {
        logger.error('[Furniture Catalog] Failed to resolve slug', { slug: transformationTypeId })
        return NextResponse.json(
          { error: 'Invalid transformation type' },
          { status: 400 }
        )
      }
    }

    // 1. Récupérer tous les meubles compatibles avec ce type de room
    const { data: furniture, error: furnitureError } = await supabase
      .from('furniture_catalog')
      .select(`
        id,
        category,
        name_fr,
        name_en,
        is_essential,
        priority
      `)
      .contains('room_types', [roomType])
      .order('priority', { ascending: false })
      .order('is_essential', { ascending: false })

    if (furnitureError) {
      logger.error('Error fetching furniture catalog', { error: furnitureError })
      return NextResponse.json(
        { error: 'Failed to fetch furniture catalog' },
        { status: 500 }
      )
    }

    // 2. Récupérer les variantes de style pour chaque meuble
    const furnitureIds = furniture?.map(f => f.id) || []

    const { data: variants, error: variantsError } = await supabase
      .from('style_furniture_variants')
      .select('furniture_id, description, materials, colors')
      .eq('transformation_type_id', resolvedTransformationTypeId)
      .in('furniture_id', furnitureIds)

    if (variantsError) {
      logger.error('Error fetching furniture variants', { error: variantsError })
      // Continue sans les variantes (non-bloquant)
    }

    // 3. Merger les meubles avec leurs variantes
    const furnitureWithVariants = furniture?.map(item => {
      const variant = variants?.find(v => v.furniture_id === item.id)
      return {
        ...item,
        variant: variant || null,
      }
    }) || []

    // 4. Récupérer le preset par défaut pour ce style + room
    const { data: preset, error: presetError } = await supabase
      .from('room_furniture_presets')
      .select('furniture_ids')
      .eq('transformation_type_id', resolvedTransformationTypeId)
      .eq('room_type', roomType)
      .eq('is_system', true)
      .single()

    if (presetError && presetError.code !== 'PGRST116') {
      logger.error('Error fetching default preset', { error: presetError })
      // Continue sans preset (non-bloquant)
    }

    logger.info('✅ Furniture catalog fetched', {
      userId: user.id,
      transformationTypeId,
      roomType,
      furnitureCount: furnitureWithVariants.length,
      hasPreset: !!preset,
    })

    return NextResponse.json({
      furniture: furnitureWithVariants,
      defaultPreset: preset?.furniture_ids || [],
    })

  } catch (error) {
    logger.error('Unexpected error in furniture catalog endpoint', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
