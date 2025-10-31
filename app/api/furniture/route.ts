import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth/check-admin'
import { logAdminAction } from '@/lib/audit/log-admin-action'
import {
  createFurnitureInputSchema,
  type FurnitureItem,
  type CreateFurnitureInput,
} from '@/domain/furniture/models/furniture'

export const dynamic = 'force-dynamic'

/**
 * GET /api/furniture
 * Liste tous les meubles actifs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer tous les meubles actifs
    const { data: furniture, error } = await supabase
      .from('furniture_catalog')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('name_fr', { ascending: true })

    if (error) {
      logger.error('[GET /api/furniture] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch furniture' },
        { status: 500 }
      )
    }

    // Mapper les données
    const furnitureList: FurnitureItem[] = (furniture || []).map((row: any) => ({
      id: row.id,
      category: row.category,
      room_types: row.room_types || [],
      name_fr: row.name_fr,
      name_en: row.name_en,
      generic_description: row.generic_description,
      typical_dimensions: row.typical_dimensions,
      is_essential: row.is_essential,
      priority: row.priority,
      icon_name: row.icon_name,
      image_url: row.image_url,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      user_id: row.user_id, // Ajouter user_id pour filtrer par propriétaire
    }))

    logger.info('[GET /api/furniture] Success', {
      userId: user.id,
      count: furnitureList.length,
    })

    return NextResponse.json({ furniture: furnitureList })
  } catch (error) {
    logger.error('[GET /api/furniture] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/furniture
 * Créer un nouveau meuble
 *
 * 🔒 SÉCURITÉ:
 * - Admins: peuvent créer des meubles par défaut (user_id = NULL)
 * - Users: peuvent créer leurs propres meubles (user_id = their ID)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parser et valider le body
    const body = await request.json()
    const validationResult = createFurnitureInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input: CreateFurnitureInput = validationResult.data

    // Vérifier si l'utilisateur est admin
    const isAdmin = await requireAdmin(supabase, user.id)

    // Déterminer le user_id:
    // - Admin créant un meuble par défaut → NULL
    // - User créant son propre meuble → user.id
    const furnitureUserId = isAdmin.isAdmin ? null : user.id

    // Insérer en base
    const { data: furniture, error } = await supabase
      .from('furniture_catalog')
      .insert({
        category: input.category,
        room_types: input.room_types,
        name_fr: input.name_fr,
        name_en: input.name_en,
        generic_description: input.generic_description,
        typical_dimensions: input.typical_dimensions,
        is_essential: input.is_essential ?? false,
        priority: input.priority ?? 50,
        icon_name: input.icon_name,
        image_url: input.image_url,
        is_active: true,
        user_id: furnitureUserId,
      })
      .select()
      .single()

    if (error) {
      logger.error('[POST /api/furniture] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to create furniture' },
        { status: 500 }
      )
    }

    const furnitureItem: FurnitureItem = {
      id: furniture.id,
      category: furniture.category,
      room_types: furniture.room_types || [],
      name_fr: furniture.name_fr,
      name_en: furniture.name_en,
      generic_description: furniture.generic_description,
      typical_dimensions: furniture.typical_dimensions,
      is_essential: furniture.is_essential,
      priority: furniture.priority,
      icon_name: furniture.icon_name,
      image_url: furniture.image_url,
      is_active: furniture.is_active,
      created_at: new Date(furniture.created_at),
      updated_at: new Date(furniture.updated_at),
    }

    logger.info('[POST /api/furniture] Furniture created', {
      userId: user.id,
      furnitureId: furnitureItem.id,
      name: furnitureItem.name_fr,
      isDefault: furnitureUserId === null,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est un meuble par défaut)
    if (furnitureUserId === null) {
      await logAdminAction({
        adminId: user.id,
        action: 'create_furniture',
        resourceType: 'furniture',
        resourceId: furnitureItem.id,
        metadata: {
          category: furnitureItem.category,
          name_fr: furnitureItem.name_fr,
          name_en: furnitureItem.name_en,
          room_types: furnitureItem.room_types,
          is_default: true,
        },
        request,
      })
    }

    return NextResponse.json({ furniture: furnitureItem }, { status: 201 })
  } catch (error) {
    logger.error('[POST /api/furniture] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
