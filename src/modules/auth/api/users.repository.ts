/**
 * Adapter : Users Repository Supabase
 * Implémentation concrète du port IUsersRepository avec Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IUsersRepository } from '@/modules/auth'
import type { User, UpdateUserInput } from '@/modules/auth'

/**
 * Type de la table Supabase users
 */
interface UserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  company: string | null
  email_verified: boolean
  credits_remaining: number
  subscription_plan_id: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Mapper : Row DB → Domain Model
 */
function mapRowToDomain(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url || undefined,
    company: row.company || undefined,
    emailVerified: row.email_verified,
    creditsBalance: row.credits_remaining,
    subscriptionPlanId: row.subscription_plan_id || undefined,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export class SupabaseUsersRepository implements IUsersRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return mapRowToDomain(data as UserRow)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch user by email: ${error.message}`)
    }

    return mapRowToDomain(data as UserRow)
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        avatar_url: user.avatarUrl || null,
        company: user.company || null,
        email_verified: user.emailVerified,
        credits_remaining: user.creditsBalance,
        subscription_plan_id: user.subscriptionPlanId || null,
        last_login_at: user.lastLoginAt?.toISOString() || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return mapRowToDomain(data as UserRow)
  }

  async updateUser(userId: string, updates: UpdateUserInput): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
        company: updates.company,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return mapRowToDomain(data as UserRow)
  }

  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update last login: ${error.message}`)
    }
  }

  async updateCreditsBalance(userId: string, newBalance: number): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ credits_remaining: newBalance })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update credits balance: ${error.message}`)
    }
  }
}
