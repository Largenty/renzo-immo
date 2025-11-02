import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Base repository interface for data access layer
 * Provides standard CRUD operations
 */
export interface IRepository<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  /**
   * Find all records with optional filtering
   */
  findAll(filters?: Record<string, unknown>): Promise<T[]>;

  /**
   * Find a single record by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Create a new record
   */
  create(data: CreateInput): Promise<T>;

  /**
   * Update an existing record
   */
  update(id: string, data: UpdateInput): Promise<T>;

  /**
   * Delete a record by ID
   */
  delete(id: string): Promise<void>;
}

/**
 * Base repository class with common Supabase operations
 */
export abstract class BaseRepository<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>
  implements IRepository<T, CreateInput, UpdateInput>
{
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient, tableName: string) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select("*");

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching ${this.tableName}: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Error fetching ${this.tableName} by id: ${error.message}`);
    }

    return data as T;
  }

  async create(input: CreateInput): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(input as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating ${this.tableName}: ${error.message}`);
    }

    return data as T;
  }

  async update(id: string, input: UpdateInput): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(input as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating ${this.tableName}: ${error.message}`);
    }

    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting ${this.tableName}: ${error.message}`);
    }
  }
}
