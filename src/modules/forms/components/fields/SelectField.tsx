'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FieldError } from '../FieldError'
import type { SelectOption } from '../../types'

interface SelectFieldProps {
  name: string
  label: string
  options: readonly SelectOption[] | SelectOption[]
  placeholder?: string
  required?: boolean
  description?: string
}

export function SelectField({
  name,
  label,
  options,
  placeholder = 'Sélectionner...',
  required = false,
  description,
}: SelectFieldProps) {
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
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger
              id={name}
              aria-invalid={!!error}
              className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {description && !error && (
        <p className="text-sm text-slate-500">{description}</p>
      )}

      <FieldError message={error} />
    </div>
  )
}
