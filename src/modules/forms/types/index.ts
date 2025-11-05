/**
 * Types communs pour les formulaires
 */

export interface ApiErrorResponse {
  error: string
  fieldErrors?: Record<string, string>
  code?: string
}

export interface SelectOption {
  value: string
  label: string
}
