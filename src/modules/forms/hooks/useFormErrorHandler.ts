'use client'

import { useCallback } from 'react'
import type { Path, FieldValues, UseFormSetError } from 'react-hook-form'
import type { ApiErrorResponse } from '../types'

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as any).error === 'string'
  )
}

export function useFormErrorHandler<TFieldValues extends FieldValues>() {
  const handleApiError = useCallback(
    (error: unknown, setError: UseFormSetError<TFieldValues>): string => {
      // Erreur réseau
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return 'Erreur de connexion. Vérifiez votre connexion internet.'
      }

      // Erreur API avec champs spécifiques
      if (isApiErrorResponse(error)) {
        // Mapper les erreurs de champs
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            setError(field as Path<TFieldValues>, {
              type: 'server',
              message,
            })
          })
        }

        // Retourner le message d'erreur global
        return error.error || 'Une erreur est survenue'
      }

      // Erreur générique
      if (error instanceof Error) {
        return error.message
      }

      // Fallback
      return 'Une erreur inattendue est survenue'
    },
    []
  )

  return { handleApiError }
}
