'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'

import {
  Form,
  TextField,
  useFormSubmit,
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { resetPasswordRequest } from '../../api/auth.service'

export function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<ForgotPasswordFormData>({
    setError,
    onSuccess: () => {
      setEmailSent(true)
    },
    successMessage: 'Email de réinitialisation envoyé',
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await handleSubmit(async () => {
      const { error } = await resetPasswordRequest(data.email)

      if (error) {
        throw new Error(error.message)
      }
    })
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Email envoyé !</h3>
        <p className="text-sm text-slate-600">
          Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot
          de passe.
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Mot de passe oublié ?</h2>
        <p className="text-sm text-slate-600">
          Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="vous@exemple.com"
        required
        autoFocus
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer l'email"
        )}
      </Button>

      <Link href="/auth/login">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Button>
      </Link>
    </Form>
  )
}
