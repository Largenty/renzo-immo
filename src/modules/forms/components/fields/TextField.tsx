'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { FieldError } from '../FieldError'

interface TextFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'tel'
  required?: boolean
  description?: string
  autoFocus?: boolean
  maxLength?: number
}

export function TextField({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  description,
  autoFocus = false,
  maxLength,
}: TextFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  const ariaDescribedBy = error
    ? `${name}-error`
    : description
    ? `${name}-description`
    : undefined

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
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            autoFocus={autoFocus}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        )}
      />

      {description && !error && (
        <p id={`${name}-description`} className="text-sm text-slate-500">
          {description}
        </p>
      )}

      <FieldError message={error} />
    </div>
  )
}
