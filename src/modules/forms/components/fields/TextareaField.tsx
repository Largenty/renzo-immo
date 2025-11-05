'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Textarea } from '@/shared/ui/textarea'
import { FieldError } from '../FieldError'

interface TextareaFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  description?: string
  rows?: number
  maxLength?: number
}

export function TextareaField({
  name,
  label,
  placeholder,
  required = false,
  description,
  rows = 4,
  maxLength,
}: TextareaFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

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
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            aria-invalid={!!error}
            className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        )}
      />

      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}

      <FieldError message={error} />
    </div>
  )
}
