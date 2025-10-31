import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { requireAdmin } from '@/lib/auth/check-admin'
import { logAdminAction } from '@/lib/audit/log-admin-action'
import {
  createRoomInputSchema,
  type RoomSpecification,
  type CreateRoomInput,
} from '@/domain/rooms/models/room'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms
 * Liste toutes les spécifications de pièces actives
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

    // Récupérer toutes les pièces actives
    const { data: rooms, error } = await supabase
      .from('room_specifications')
      .select('*')
      .eq('is_active', true)
      .order('display_name_fr', { ascending: true })

    if (error) {
      logger.error('[GET /api/rooms] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      )
    }

    // Mapper les données
    const roomsList: RoomSpecification[] = (rooms || []).map((row: any) => ({
      id: row.id,
      room_type: row.room_type,
      display_name_fr: row.display_name_fr,
      display_name_en: row.display_name_en,
      constraints_text: row.constraints_text,
      typical_area_min: row.typical_area_min,
      typical_area_max: row.typical_area_max,
      zones: row.zones,
      description: row.description,
      icon_name: row.icon_name,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      user_id: row.user_id, // Ajouter user_id pour filtrer par propriétaire
    }))

    logger.info('[GET /api/rooms] Success', {
      userId: user.id,
      count: roomsList.length,
    })

    return NextResponse.json({ rooms: roomsList })
  } catch (error) {
    logger.error('[GET /api/rooms] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/rooms
 * Créer une nouvelle spécification de pièce
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
    const validationResult = createRoomInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input: CreateRoomInput = validationResult.data

    // Vérifier si l'utilisateur est admin
    const isAdmin = await requireAdmin(supabase, user.id)

    // Déterminer le user_id:
    // - Admin créant une pièce par défaut → NULL
    // - User créant sa propre pièce → user.id
    const roomUserId = isAdmin.isAdmin ? null : user.id

    // Insérer en base
    const { data: room, error } = await supabase
      .from('room_specifications')
      .insert({
        room_type: input.room_type,
        display_name_fr: input.display_name_fr,
        display_name_en: input.display_name_en,
        constraints_text: input.constraints_text,
        typical_area_min: input.typical_area_min,
        typical_area_max: input.typical_area_max,
        zones: input.zones,
        description: input.description,
        icon_name: input.icon_name,
        is_active: true,
        user_id: roomUserId,
      })
      .select()
      .single()

    if (error) {
      logger.error('[POST /api/rooms] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to create room' },
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
    }

    logger.info('[POST /api/rooms] Room created', {
      userId: user.id,
      roomId: roomSpec.id,
      roomType: roomSpec.room_type,
      isDefault: roomUserId === null,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (roomUserId === null) {
      await logAdminAction({
        adminId: user.id,
        action: 'create_room',
        resourceType: 'room',
        resourceId: roomSpec.id,
        metadata: {
          room_type: roomSpec.room_type,
          display_name_fr: roomSpec.display_name_fr,
          display_name_en: roomSpec.display_name_en,
          is_default: true,
        },
        request,
      })
    }

    return NextResponse.json({ room: roomSpec }, { status: 201 })
  } catch (error) {
    logger.error('[POST /api/rooms] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
