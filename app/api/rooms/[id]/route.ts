import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth/check-admin'
import { logAdminAction } from '@/lib/audit/log-admin-action'
import {
  updateRoomInputSchema,
  type RoomSpecification,
  type UpdateRoomInput,
} from '@/domain/rooms/models/room'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms/[id]
 * Récupérer une pièce par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const roomId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer la pièce
    const { data: room, error } = await supabase
      .from('room_specifications')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      logger.error('[GET /api/rooms/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch room' },
        { status: 500 }
      )
    }

    const roomSpec: RoomSpecification = {
      id: room.id,
      room_type: room.room_type,
      display_name_fr: room.display_name_fr,
      display_name_en: room.display_name_en,
      constraints_text: room.constraints_text,
      typical_area_min: room.typical_area_min,
      typical_area_max: room.typical_area_max,
      zones: room.zones,
      description: room.description,
      icon_name: room.icon_name,
      is_active: room.is_active,
      created_at: new Date(room.created_at),
      updated_at: new Date(room.updated_at),
      user_id: room.user_id,
    }

    return NextResponse.json({ room: roomSpec })
  } catch (error) {
    logger.error('[GET /api/rooms/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/rooms/[id]
 * Mettre à jour une pièce
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent modifier leurs propres pièces (user_id = their ID)
 * - Admins peuvent modifier les pièces par défaut (user_id = NULL)
 * - Les pièces par défaut ne peuvent PAS être modifiées par les users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const roomId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que la pièce existe et récupérer son user_id
    const { data: existingRoom, error: fetchError } = await supabase
      .from('room_specifications')
      .select('user_id')
      .eq('id', roomId)
      .single()

    if (fetchError || !existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Vérifier les permissions:
    // - Si user_id = NULL (pièce par défaut) → seulement admin peut modifier
    // - Si user_id = user.id → le user peut modifier sa propre pièce
    const isDefaultRoom = existingRoom.user_id === null
    const isOwnRoom = existingRoom.user_id === user.id

    if (isDefaultRoom) {
      // Pièce par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot modify default room' },
          { status: 403 }
        )
      }
    } else if (!isOwnRoom) {
      // Pièce d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify room of another user' },
        { status: 403 }
      )
    }
    // Si c'est sa propre pièce, pas besoin de check admin

    // Parser et valider le body
    const body = await request.json()
    const validationResult = updateRoomInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input: UpdateRoomInput = validationResult.data

    // Construire l'objet de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.display_name_fr !== undefined) updateData.display_name_fr = input.display_name_fr
    if (input.display_name_en !== undefined) updateData.display_name_en = input.display_name_en
    if (input.constraints_text !== undefined) updateData.constraints_text = input.constraints_text
    if (input.typical_area_min !== undefined) updateData.typical_area_min = input.typical_area_min
    if (input.typical_area_max !== undefined) updateData.typical_area_max = input.typical_area_max
    if (input.zones !== undefined) updateData.zones = input.zones
    if (input.description !== undefined) updateData.description = input.description
    if (input.icon_name !== undefined) updateData.icon_name = input.icon_name
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    // Mettre à jour en base
    const { data: room, error } = await supabase
      .from('room_specifications')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      logger.error('[PATCH /api/rooms/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to update room' },
        { status: 500 }
      )
    }

    const roomSpec: RoomSpecification = {
      id: room.id,
      room_type: room.room_type,
      display_name_fr: room.display_name_fr,
      display_name_en: room.display_name_en,
      constraints_text: room.constraints_text,
      typical_area_min: room.typical_area_min,
      typical_area_max: room.typical_area_max,
      zones: room.zones,
      description: room.description,
      icon_name: room.icon_name,
      is_active: room.is_active,
      created_at: new Date(room.created_at),
      updated_at: new Date(room.updated_at),
      user_id: room.user_id,
    }

    logger.info('[PATCH /api/rooms/[id]] Room updated', {
      userId: user.id,
      roomId: roomSpec.id,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: 'update_room',
        resourceType: 'room',
        resourceId: roomSpec.id,
        metadata: {
          updated_fields: input,
          display_name_fr: roomSpec.display_name_fr,
          is_default: true,
        },
        request,
      })
    }

    return NextResponse.json({ room: roomSpec })
  } catch (error) {
    logger.error('[PATCH /api/rooms/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/rooms/[id]
 * Supprimer une pièce
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent supprimer leurs propres pièces (user_id = their ID)
 * - Admins peuvent supprimer les pièces par défaut (user_id = NULL)
 * - Les pièces par défaut ne peuvent PAS être supprimées par les users
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const roomId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que la pièce existe et récupérer son user_id
    const { data: existingRoom, error: fetchError } = await supabase
      .from('room_specifications')
      .select('user_id')
      .eq('id', roomId)
      .single()

    if (fetchError || !existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Vérifier les permissions (même logique que PATCH)
    const isDefaultRoom = existingRoom.user_id === null
    const isOwnRoom = existingRoom.user_id === user.id

    if (isDefaultRoom) {
      // Pièce par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot delete default room' },
          { status: 403 }
        )
      }
    } else if (!isOwnRoom) {
      // Pièce d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete room of another user' },
        { status: 403 }
      )
    }

    // Supprimer la pièce (soft delete)
    const { error } = await supabase
      .from('room_specifications')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', roomId)

    if (error) {
      logger.error('[DELETE /api/rooms/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to delete room' },
        { status: 500 }
      )
    }

    logger.info('[DELETE /api/rooms/[id]] Room deleted', {
      userId: user.id,
      roomId,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: 'delete_room',
        resourceType: 'room',
        resourceId: roomId,
        metadata: { is_default: true },
        request,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[DELETE /api/rooms/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
