/**
 * Module Auth - Exports
 * Tout ce qui concerne l'authentification au même endroit
 */

// Types
export * from './types'

// Hooks
export * from './ui/hooks/use-auth'

// Components
export { AuthCard } from './ui/components/AuthCard'
export { AuthLoading } from './ui/components/AuthLoading'

// Forms (React Hook Form + Zod)
export { LoginForm } from './ui/forms/LoginForm'
export { SignupForm } from './ui/forms/SignupForm'
export { ForgotPasswordForm } from './ui/forms/ForgotPasswordForm'
export { ResetPasswordForm } from './ui/forms/ResetPasswordForm'

// API
export { SupabaseAuthProvider } from './api/auth.service'
export { SupabaseAuthProvider as SupabaseAuthAdapter } from './api/auth.service' // Alias for backward compatibility
export { SupabaseUsersRepository } from './api/users.repository'

// Helper functions
export { login, signup, signOut, resetPasswordRequest, updatePassword } from './api/auth.service'

// Services
export { AuthenticateService } from './services/authenticate'
export { ManageUserService } from './services/manage-user'
