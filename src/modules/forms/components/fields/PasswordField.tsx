'use client'

import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FieldError } from '../FieldError'

interface PasswordFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  description?: string
  showStrength?: boolean
  autoFocus?: boolean
}

function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  if (!password) {
    return { score: 0, label: '', color: '' }
  }

  let score = 0

  // Longueur
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Complexité
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) {
    return { score: 1, label: 'Faible', color: 'bg-red-500' }
  } else if (score <= 4) {
    return { score: 2, label: 'Moyen', color: 'bg-yellow-500' }
  } else {
    return { score: 3, label: 'Fort', color: 'bg-green-500' }
  }
}

export function PasswordField({
  name,
  label,
  placeholder,
  required = false,
  description,
  showStrength = false,
  autoFocus = false,
}: PasswordFieldProps) {
  const { control, formState: { errors }, watch } = useFormContext()
  const [showPassword, setShowPassword] = useState(false)

  const error = errors[name]?.message as string | undefined
  const passwordValue = watch(name) as string

  const strength = showStrength ? calculatePasswordStrength(passwordValue || '') : null

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              autoFocus={autoFocus}
              aria-invalid={!!error}
              className={error ? 'border-red-500 focus-visible:ring-red-500 pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-slate-400" />
              ) : (
                <Eye className="h-4 w-4 text-slate-400" />
              )}
              <span className="sr-only">
                {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              </span>
            </Button>
          </div>
        )}
      />

      {showStrength && strength && strength.score > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  level <= strength.score ? strength.color : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-600">Force : {strength.label}</p>
        </div>
      )}

      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}

      <FieldError message={error} />
    </div>
  )
}
