'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { FieldError } from '../FieldError'

interface NumberFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  unit?: string
  description?: string
  autoFocus?: boolean
}

export function NumberField({
  name,
  label,
  placeholder,
  required = false,
  min,
  max,
  step = 1,
  unit,
  description,
  autoFocus = false,
}: NumberFieldProps) {
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
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <div className="relative">
            <Input
              id={name}
              type="number"
              placeholder={placeholder}
              value={value ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onChange(val === '' ? null : parseFloat(val))
              }}
              onBlur={onBlur}
              ref={ref}
              min={min}
              max={max}
              step={step}
              autoFocus={autoFocus}
              aria-invalid={!!error}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                {unit}
              </span>
            )}
          </div>
        )}
      />

      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}

      <FieldError message={error} />
    </div>
  )
}
