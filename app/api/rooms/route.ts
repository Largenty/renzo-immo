import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { isUserAdmin } from '@/lib/auth/check-admin'
import { logAdminAction } from '@/lib/audit/log-admin-action'
import { RoomsRepository } from '@/modules/rooms'
import {
  createRoomInputSchema,
  type CreateRoomInput,
} from '@/modules/rooms'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rooms
 * Liste toutes les spécifications de pièces actives (pièces par défaut + pièces de l'utilisateur)
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

    // ✅ Utiliser le repository au lieu de requêtes directes
    const roomsRepo = new RoomsRepository(supabase)
    const roomsList = await roomsRepo.findAllForUser(user.id)

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
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    const input: CreateRoomInput = validationResult.data

    // Vérifier si l'utilisateur est admin
    const isAdmin = await isUserAdmin(supabase, user.id)

    // ✅ Utiliser le repository au lieu de requêtes directes
    const roomsRepo = new RoomsRepository(supabase)
    const roomSpec = isAdmin
      ? await roomsRepo.createDefaultRoom(input)
      : await roomsRepo.createUserRoom(user.id, input)

    logger.info('[POST /api/rooms] Room created', {
      userId: user.id,
      roomId: roomSpec.id,
      roomType: roomSpec.room_type,
      isDefault: roomSpec.user_id === null,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (roomSpec.user_id === null) {
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
