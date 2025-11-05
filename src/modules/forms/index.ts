/**
 * Module Forms - Architecture React Hook Form + Zod
 *
 * Ce module fournit tous les composants, hooks et schemas
 * pour la gestion unifiée des formulaires dans l'application
 */

// Components
export { Form } from './components/Form'
export { FormError } from './components/FormError'
export { FieldError } from './components/FieldError'

// Field Components
export { TextField } from './components/fields/TextField'
export { TextareaField } from './components/fields/TextareaField'
export { PasswordField } from './components/fields/PasswordField'
export { SelectField } from './components/fields/SelectField'
export { NumberField } from './components/fields/NumberField'
export { CheckboxField } from './components/fields/CheckboxField'
export { SwitchField } from './components/fields/SwitchField'
export { FileUploadField } from './components/fields/FileUploadField'

// Hooks
export { useFormErrorHandler } from './hooks/useFormErrorHandler'
export { useFormSubmit } from './hooks/useFormSubmit'

// Schemas - Auth
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  passwordSchema,
} from './schemas/auth.schemas'
export type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from './schemas/auth.schemas'

// Schemas - Projects
export {
  createProjectSchema,
  editProjectSchema,
} from './schemas/project.schemas'
export type {
  CreateProjectFormData,
  EditProjectFormData,
} from './schemas/project.schemas'

// Schemas - Rooms
export {
  roomSchema,
  roomTypeSchema,
} from './schemas/room.schemas'
export type {
  RoomFormData,
  RoomTypeFormData,
} from './schemas/room.schemas'

// Schemas - Room Specifications
export {
  roomSpecificationSchema,
} from './schemas/room-specification.schemas'
export type {
  RoomSpecificationFormData,
} from './schemas/room-specification.schemas'

// Schemas - Settings
export {
  profileSettingsSchema,
  changePasswordSchema,
  notificationSettingsSchema,
} from './schemas/settings.schemas'
export type {
  ProfileSettingsFormData,
  ChangePasswordFormData,
  NotificationSettingsFormData,
} from './schemas/settings.schemas'

// Types
export type { ApiErrorResponse, SelectOption } from './types'
