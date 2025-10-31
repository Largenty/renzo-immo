import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth/check-admin'
import { logAdminAction } from '@/lib/audit/log-admin-action'
import {
  updateFurnitureInputSchema,
  type FurnitureItem,
  type UpdateFurnitureInput,
} from '@/domain/furniture/models/furniture'

export const dynamic = 'force-dynamic'

/**
 * GET /api/furniture/[id]
 * Récupérer un meuble par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const furnitureId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer le meuble
    const { data: furniture, error } = await supabase
      .from('furniture_catalog')
      .select('*')
      .eq('id', furnitureId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Furniture not found' }, { status: 404 })
      }
      logger.error('[GET /api/furniture/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch furniture' },
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

    return NextResponse.json({ furniture: furnitureItem })
  } catch (error) {
    logger.error('[GET /api/furniture/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/furniture/[id]
 * Mettre à jour un meuble
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent modifier leurs propres meubles (user_id = their ID)
 * - Admins peuvent modifier les meubles par défaut (user_id = NULL)
 * - Les meubles par défaut ne peuvent PAS être modifiés par les users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const furnitureId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que le meuble existe et récupérer son user_id
    const { data: existingFurniture, error: fetchError } = await supabase
      .from('furniture_catalog')
      .select('user_id')
      .eq('id', furnitureId)
      .single()

    if (fetchError || !existingFurniture) {
      return NextResponse.json({ error: 'Furniture not found' }, { status: 404 })
    }

    // Vérifier les permissions:
    // - Si user_id = NULL (meuble par défaut) → seulement admin peut modifier
    // - Si user_id = user.id → le user peut modifier son propre meuble
    const isDefaultFurniture = existingFurniture.user_id === null
    const isOwnFurniture = existingFurniture.user_id === user.id

    if (isDefaultFurniture) {
      // Meuble par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot modify default furniture' },
          { status: 403 }
        )
      }
    } else if (!isOwnFurniture) {
      // Meuble d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify furniture of another user' },
        { status: 403 }
      )
    }
    // Si c'est son propre meuble, pas besoin de check admin

    // Parser et valider le body
    const body = await request.json()
    const validationResult = updateFurnitureInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input: UpdateFurnitureInput = validationResult.data

    // Construire l'objet de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.category !== undefined) updateData.category = input.category
    if (input.room_types !== undefined) updateData.room_types = input.room_types
    if (input.name_fr !== undefined) updateData.name_fr = input.name_fr
    if (input.name_en !== undefined) updateData.name_en = input.name_en
    if (input.generic_description !== undefined)
      updateData.generic_description = input.generic_description
    if (input.typical_dimensions !== undefined)
      updateData.typical_dimensions = input.typical_dimensions
    if (input.is_essential !== undefined) updateData.is_essential = input.is_essential
    if (input.priority !== undefined) updateData.priority = input.priority
    if (input.icon_name !== undefined) updateData.icon_name = input.icon_name
    if (input.image_url !== undefined) updateData.image_url = input.image_url
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    // Mettre à jour en base
    const { data: furniture, error } = await supabase
      .from('furniture_catalog')
      .update(updateData)
      .eq('id', furnitureId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Furniture not found' }, { status: 404 })
      }
      logger.error('[PATCH /api/furniture/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to update furniture' },
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

    logger.info('[PATCH /api/furniture/[id]] Furniture updated', {
      userId: user.id,
      furnitureId: furnitureItem.id,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est un meuble par défaut)
    if (isDefaultFurniture) {
      await logAdminAction({
        adminId: user.id,
        action: 'update_furniture',
        resourceType: 'furniture',
        resourceId: furnitureItem.id,
        metadata: {
          updated_fields: input,
          name_fr: furnitureItem.name_fr,
          is_default: true,
        },
        request,
      })
    }

    return NextResponse.json({ furniture: furnitureItem })
  } catch (error) {
    logger.error('[PATCH /api/furniture/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/furniture/[id]
 * Supprimer un meuble
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent supprimer leurs propres meubles (user_id = their ID)
 * - Admins peuvent supprimer les meubles par défaut (user_id = NULL)
 * - Les meubles par défaut ne peuvent PAS être supprimés par les users
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const furnitureId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que le meuble existe et récupérer son user_id
    const { data: existingFurniture, error: fetchError } = await supabase
      .from('furniture_catalog')
      .select('user_id')
      .eq('id', furnitureId)
      .single()

    if (fetchError || !existingFurniture) {
      return NextResponse.json({ error: 'Furniture not found' }, { status: 404 })
    }

    // Vérifier les permissions (même logique que PATCH)
    const isDefaultFurniture = existingFurniture.user_id === null
    const isOwnFurniture = existingFurniture.user_id === user.id

    if (isDefaultFurniture) {
      // Meuble par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot delete default furniture' },
          { status: 403 }
        )
      }
    } else if (!isOwnFurniture) {
      // Meuble d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete furniture of another user' },
        { status: 403 }
      )
    }

    // Supprimer le meuble (soft delete)
    const { error } = await supabase
      .from('furniture_catalog')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', furnitureId)

    if (error) {
      logger.error('[DELETE /api/furniture/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to delete furniture' },
        { status: 500 }
      )
    }

    logger.info('[DELETE /api/furniture/[id]] Furniture deleted', {
      userId: user.id,
      furnitureId,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est un meuble par défaut)
    if (isDefaultFurniture) {
      await logAdminAction({
        adminId: user.id,
        action: 'delete_furniture',
        resourceType: 'furniture',
        resourceId: furnitureId,
        metadata: { is_default: true },
        request,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[DELETE /api/furniture/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
