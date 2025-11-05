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
  loginSchema,
  type LoginFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { login } from '../../api/auth.service'

export function LoginForm() {
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<LoginFormData>({
    setError,
    onSuccess: () => {
      router.push('/dashboard')
      router.refresh()
    },
    successMessage: 'Connexion réussie',
  })

  const onSubmit = async (data: LoginFormData) => {
    await handleSubmit(async () => {
      const { error } = await login(data.email, data.password)

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
      />

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-700">
          Créer un compte
        </Link>
      </p>
    </Form>
  )
}
