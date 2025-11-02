import { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base.repository";
import type {
  RoomSpecification,
  CreateRoomInput,
  UpdateRoomInput,
  RoomType,
} from "@/domain/rooms/models/room";

/**
 * Repository pour la gestion des spécifications de pièces (Rooms)
 * Encapsule toutes les opérations de données liées aux pièces
 */
export class RoomsRepository extends BaseRepository<
  RoomSpecification,
  CreateRoomInput,
  UpdateRoomInput
> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "room_specifications");
  }

  /**
   * Récupère toutes les spécifications de pièces par défaut (user_id = null)
   */
  async findDefaultRooms(): Promise<RoomSpecification[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .is("user_id", null)
      .eq("is_active", true)
      .order("room_type", { ascending: true });

    if (error) {
      throw new Error(`Error fetching default rooms: ${error.message}`);
    }

    return (data as RoomSpecification[]) || [];
  }

  /**
   * Récupère toutes les spécifications de pièces personnalisées d'un utilisateur
   */
  async findUserRooms(userId: string): Promise<RoomSpecification[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching user rooms: ${error.message}`);
    }

    return (data as RoomSpecification[]) || [];
  }

  /**
   * Récupère toutes les spécifications de pièces (défaut + utilisateur)
   */
  async findAllForUser(userId?: string): Promise<RoomSpecification[]> {
    let query = this.supabase
      .from(this.tableName)
      .select("*")
      .eq("is_active", true);

    if (userId) {
      // Pièces par défaut OU pièces de l'utilisateur
      query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    } else {
      // Seulement les pièces par défaut
      query = query.is("user_id", null);
    }

    query = query.order("room_type", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching rooms: ${error.message}`);
    }

    return (data as RoomSpecification[]) || [];
  }

  /**
   * Récupère une spécification de pièce par type
   */
  async findByRoomType(roomType: RoomType, userId?: string): Promise<RoomSpecification | null> {
    let query = this.supabase
      .from(this.tableName)
      .select("*")
      .eq("room_type", roomType)
      .eq("is_active", true);

    if (userId) {
      // Priorité aux pièces personnalisées
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      query = query.is("user_id", null);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Error fetching room by type: ${error.message}`);
    }

    // Si plusieurs résultats (user + default), retourner celui de l'utilisateur
    if (data && data.length > 0) {
      const userRoom = data.find((r) => r.user_id === userId);
      return (userRoom || data[0]) as RoomSpecification;
    }

    return null;
  }

  /**
   * Crée une spécification de pièce personnalisée pour un utilisateur
   */
  async createUserRoom(
    userId: string,
    input: CreateRoomInput
  ): Promise<RoomSpecification> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...input,
        user_id: userId,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user room: ${error.message}`);
    }

    return data as RoomSpecification;
  }

  /**
   * Crée une spécification de pièce par défaut (admin uniquement)
   */
  async createDefaultRoom(input: CreateRoomInput): Promise<RoomSpecification> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        ...input,
        user_id: null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating default room: ${error.message}`);
    }

    return data as RoomSpecification;
  }

  /**
   * Vérifie si une pièce appartient à un utilisateur
   */
  async isOwnedByUser(roomId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("user_id")
      .eq("id", roomId)
      .single();

    if (error) {
      return false;
    }

    return data?.user_id === userId;
  }

  /**
   * Vérifie si une pièce est une pièce par défaut
   */
  async isDefaultRoom(roomId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("user_id")
      .eq("id", roomId)
      .single();

    if (error) {
      return false;
    }

    return data?.user_id === null;
  }
}
