/**
 * Port : Users Repository
 * Interface abstraite pour accéder aux données utilisateurs
 */

import type { User, UpdateUserInput } from '../models/user'

export interface IUsersRepository {
  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(userId: string): Promise<User | null>

  /**
   * Récupérer un utilisateur par email
   */
  getUserByEmail(email: string): Promise<User | null>

  /**
   * Créer un utilisateur
   */
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(userId: string, updates: UpdateUserInput): Promise<User>

  /**
   * Mettre à jour le dernier login
   */
  updateLastLogin(userId: string): Promise<void>

  /**
   * Mettre à jour le solde de crédits
   */
  updateCreditsBalance(userId: string, newBalance: number): Promise<void>
}
