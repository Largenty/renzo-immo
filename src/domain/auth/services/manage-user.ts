/**
 * Service : Gérer l'utilisateur
 * Cas d'usage pour mettre à jour le profil utilisateur
 */

import type { IUsersRepository } from '../ports/users-repository'
import type { User, UpdateUserInput } from '../models/user'
import { updateUserInputSchema } from '../models/user'

export class ManageUserService {
  constructor(private readonly usersRepository: IUsersRepository) {}

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.usersRepository.getUserById(userId)
  }

  /**
   * Récupérer un utilisateur par email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getUserByEmail(email)
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    // 1. Valider l'input
    const validatedInput = updateUserInputSchema.parse(input)

    // 2. Mettre à jour
    return this.usersRepository.updateUser(userId, validatedInput)
  }

  /**
   * Mettre à jour le solde de crédits
   */
  async updateCreditsBalance(userId: string, newBalance: number): Promise<void> {
    if (newBalance < 0) {
      throw new Error('Le solde de crédits ne peut pas être négatif')
    }

    return this.usersRepository.updateCreditsBalance(userId, newBalance)
  }
}
