/**
 * Service : Authentification
 * Cas d'usage pour login, signup, logout, reset password
 */

import type { IAuthProvider } from '../types'
import type { IUsersRepository } from '../types'
import type {
  User,
  Session,
  SignUpInput,
  SignInInput,
  AuthResult,
} from '../types'
import { signUpInputSchema, signInInputSchema, resetPasswordInputSchema } from '../types'
import { validatePasswordStrength } from '../utils/validate-password'

export class AuthenticateService {
  constructor(
    private readonly authProvider: IAuthProvider,
    private readonly usersRepository: IUsersRepository
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(input: SignUpInput): Promise<AuthResult> {
    try {
      // 1. Valider l'input
      const validatedInput = signUpInputSchema.parse(input)

      // 2. Vérifier la force du mot de passe
      const passwordStrength = validatePasswordStrength(validatedInput.password)
      if (!passwordStrength.isValid) {
        return {
          success: false,
          error: `Mot de passe trop faible : ${passwordStrength.feedback.join(', ')}`,
        }
      }

      // 3. Créer le compte via le provider
      const user = await this.authProvider.signUp(validatedInput)

      return {
        success: true,
        message: 'Compte créé ! Vérifiez votre email pour confirmer votre adresse.',
        user,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
      }
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(input: SignInInput): Promise<AuthResult> {
    try {
      // 1. Valider l'input
      const validatedInput = signInInputSchema.parse(input)

      // 2. Se connecter via le provider
      const { user, session } = await this.authProvider.signIn(validatedInput)

      // 3. Mettre à jour le dernier login
      await this.usersRepository.updateLastLogin(user.id)

      return {
        success: true,
        user,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la connexion',
      }
    }
  }

  /**
   * Connexion avec Google OAuth
   */
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const { url } = await this.authProvider.signInWithGoogle()

      return {
        success: true,
        message: url,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la connexion Google',
      }
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<AuthResult> {
    try {
      await this.authProvider.signOut()

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la déconnexion',
      }
    }
  }

  /**
   * Réinitialisation de mot de passe
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      // 1. Valider l'email
      const { email: validatedEmail } = resetPasswordInputSchema.parse({ email })

      // 2. Envoyer l'email de réinitialisation
      await this.authProvider.resetPassword(validatedEmail)

      return {
        success: true,
        message: 'Email de réinitialisation envoyé ! Vérifiez votre boîte mail.',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation',
      }
    }
  }

  /**
   * Récupérer l'utilisateur courant
   */
  async getCurrentUser(): Promise<User | null> {
    return this.authProvider.getCurrentUser()
  }

  /**
   * Récupérer la session courante
   */
  async getSession(): Promise<Session | null> {
    return this.authProvider.getSession()
  }
}
