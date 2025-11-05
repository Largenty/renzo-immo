'use client'

import { useState, useCallback } from 'react'
import type { UseFormSetError, FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { useFormErrorHandler } from './useFormErrorHandler'

interface UseFormSubmitOptions<TFieldValues extends FieldValues> {
  setError: UseFormSetError<TFieldValues>
  onSuccess?: () => void
  successMessage?: string
  loadingMessage?: string
}

export function useFormSubmit<TFieldValues extends FieldValues>({
  setError,
  onSuccess,
  successMessage = 'Opération réussie',
  loadingMessage = 'Traitement en cours...',
}: UseFormSubmitOptions<TFieldValues>) {
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { handleApiError } = useFormErrorHandler<TFieldValues>()

  const handleSubmit = useCallback(
    async (mutationFn: () => Promise<void>) => {
      setGlobalError(null)
      setIsSubmitting(true)

      const toastId = toast.loading(loadingMessage)

      try {
        await mutationFn()
        toast.success(successMessage, { id: toastId })
        onSuccess?.()
      } catch (error) {
        const errorMessage = handleApiError(error, setError)
        setGlobalError(errorMessage)
        toast.error(errorMessage, { id: toastId })
      } finally {
        setIsSubmitting(false)
      }
    },
    [setError, onSuccess, successMessage, loadingMessage, handleApiError]
  )

  return {
    handleSubmit,
    isSubmitting,
    globalError,
    setGlobalError,
  }
}
