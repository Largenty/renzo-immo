'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import {
  Form,
  PasswordField,
  useFormSubmit,
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { updatePassword } from '../../api/auth.service'

export function ResetPasswordForm() {
  const router = useRouter()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<ResetPasswordFormData>({
    setError,
    onSuccess: () => {
      router.push('/auth/login')
    },
    successMessage: 'Mot de passe modifié avec succès',
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    await handleSubmit(async () => {
      const { error } = await updatePassword(data.password)

      if (error) {
        throw new Error(error.message)
      }
    })
  }

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h2>
        <p className="text-sm text-slate-600">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      <PasswordField
        name="password"
        label="Nouveau mot de passe"
        placeholder="••••••••"
        required
        showStrength
        autoFocus
      />

      <PasswordField
        name="confirmPassword"
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        required
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Modification...
          </>
        ) : (
          'Réinitialiser le mot de passe'
        )}
      </Button>
    </Form>
  )
}
