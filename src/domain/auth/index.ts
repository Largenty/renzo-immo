/**
 * Domaine Auth - Point d'entrée
 * Export tous les éléments publics du domaine
 */

// Models
export * from './models/user'

// Business Rules
export * from './business-rules/validate-password'

// Ports
export type { IAuthProvider } from './ports/auth-provider'
export type { IUsersRepository } from './ports/users-repository'

// Services
export { AuthenticateService } from './services/authenticate'
export { ManageUserService } from './services/manage-user'

// Hooks (React)
export {
  useCurrentUser,
  useSession,
  useSignUp,
  useSignIn,
  useSignOut,
  useResetPassword,
  useUpdateUser,
} from './hooks/use-auth'
