import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth/check-admin";
import { logAdminAction } from "@/lib/audit/log-admin-action";
import { requireOwnerOrAdmin } from "@/lib/api/middleware/permissions";
import { RoomsRepository } from "@/modules/rooms";
import {
  updateRoomInputSchema,
  type UpdateRoomInput,
} from "@/modules/rooms";

export const dynamic = "force-dynamic";

/**
 * GET /api/rooms/[id]
 * Récupérer une pièce par ID
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent voir les pièces par défaut (user_id = NULL)
 * - Users peuvent voir leurs propres pièces (user_id = their ID)
 * - Users NE peuvent PAS voir les pièces des autres utilisateurs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const roomId = params.id;

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Utiliser le repository
    const roomsRepo = new RoomsRepository(supabase);
    const roomSpec = await roomsRepo.findById(roomId);

    if (!roomSpec) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 🔒 Vérifier les permissions: seuls les pièces par défaut ou celles de l'utilisateur sont accessibles
    const permissionError = requireOwnerOrAdmin(user, roomSpec.user_id);
    if (permissionError) {
      return permissionError;
    }

    return NextResponse.json({ room: roomSpec });
  } catch (error) {
    logger.error("[GET /api/rooms/[id]] Unexpected error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const supabase = await createClient();
    const roomId = params.id;

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Utiliser le repository pour récupérer la pièce
    const roomsRepo = new RoomsRepository(supabase);
    const existingRoom = await roomsRepo.findById(roomId);

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // ✅ Utiliser le middleware de permissions
    const permissionError = requireOwnerOrAdmin(user, existingRoom.user_id);
    if (permissionError) {
      return permissionError;
    }

    const isDefaultRoom = existingRoom.user_id === null;

    // Parser et valider le body
    const body = await request.json();
    const validationResult = updateRoomInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const input: UpdateRoomInput = validationResult.data;

    // ✅ Utiliser le repository avec admin client pour la mise à jour (bypass RLS après vérification des permissions)
    const adminRepo = new RoomsRepository(supabaseAdmin);
    const roomSpec = await adminRepo.update(roomId, input);

    logger.info("[PATCH /api/rooms/[id]] Room updated", {
      userId: user.id,
      roomId: roomSpec.id,
    });

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: "update_room",
        resourceType: "room",
        resourceId: roomSpec.id,
        metadata: {
          updated_fields: input,
          display_name_fr: roomSpec.display_name_fr,
          is_default: true,
        },
        request,
      });
    }

    return NextResponse.json({ room: roomSpec });
  } catch (error) {
    logger.error("[PATCH /api/rooms/[id]] Unexpected error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const supabase = await createClient();
    const roomId = params.id;

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Utiliser le repository pour récupérer la pièce
    const roomsRepo = new RoomsRepository(supabase);
    const existingRoom = await roomsRepo.findById(roomId);

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // ✅ Utiliser le middleware de permissions
    const permissionError = requireOwnerOrAdmin(user, existingRoom.user_id);
    if (permissionError) {
      return permissionError;
    }

    const isDefaultRoom = existingRoom.user_id === null;

    // ✅ Soft delete via repository avec admin client (bypass RLS après vérification des permissions)
    const adminRepo = new RoomsRepository(supabaseAdmin);
    await adminRepo.update(roomId, { is_active: false });

    logger.info("[DELETE /api/rooms/[id]] Room deleted", {
      userId: user.id,
      roomId,
    });

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: "delete_room",
        resourceType: "room",
        resourceId: roomId,
        metadata: { is_default: true },
        request,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[DELETE /api/rooms/[id]] Unexpected error", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
