'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import {
  Form,
  TextField,
  PasswordField,
  CheckboxField,
  useFormSubmit,
  signupSchema,
  type SignupFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { signup } from '../../api/auth.service'

export function SignupForm() {
  const router = useRouter()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<SignupFormData>({
    setError,
    onSuccess: () => {
      router.push('/auth/verify-email')
    },
    successMessage: 'Compte créé avec succès',
  })

  const onSubmit = async (data: SignupFormData) => {
    await handleSubmit(async () => {
      const { error } = await signup(data.email, data.password)

      if (error) {
        throw new Error(error.message)
      }
    })
  }

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="vous@exemple.com"
        required
        autoFocus
      />

      <PasswordField
        name="password"
        label="Mot de passe"
        placeholder="••••••••"
        required
        showStrength
      />

      <PasswordField
        name="confirmPassword"
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        required
      />

      <CheckboxField
        name="acceptTerms"
        label={
          <>
            J'accepte les{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:text-blue-700 underline">
              conditions générales
            </Link>{' '}
            et la{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-700 underline">
              politique de confidentialité
            </Link>
          </>
        }
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création du compte...
          </>
        ) : (
          'Créer mon compte'
        )}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Déjà un compte ?{' '}
        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700">
          Se connecter
        </Link>
      </p>
    </Form>
  )
}
