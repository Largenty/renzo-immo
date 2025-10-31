/**
 * Port : Auth Provider
 * Interface abstraite pour l'authentification
 */

import type {
  User,
  Session,
  SignUpInput,
  SignInInput,
  UpdateUserInput,
} from '../models/user'

export interface IAuthProvider {
  /**
   * Inscription avec email/password
   */
  signUp(input: SignUpInput): Promise<User>

  /**
   * Connexion avec email/password
   */
  signIn(input: SignInInput): Promise<{ user: User; session: Session }>

  /**
   * Connexion avec Google OAuth
   */
  signInWithGoogle(): Promise<{ url: string }>

  /**
   * Déconnexion
   */
  signOut(): Promise<void>

  /**
   * Réinitialisation de mot de passe
   */
  resetPassword(email: string): Promise<void>

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser(): Promise<User | null>

  /**
   * Récupérer la session courante
   */
  getSession(): Promise<Session | null>

  /**
   * Mettre à jour l'utilisateur
   */
  updateUser(userId: string, input: UpdateUserInput): Promise<User>
}
