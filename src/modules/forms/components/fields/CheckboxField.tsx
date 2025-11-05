'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Checkbox } from '@/shared/ui/checkbox'
import { FieldError } from '../FieldError'

interface CheckboxFieldProps {
  name: string
  label: string | React.ReactNode
  description?: string
}

export function CheckboxField({ name, label, description }: CheckboxFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex items-start space-x-3">
            <Checkbox
              id={name}
              checked={value}
              onCheckedChange={onChange}
              aria-invalid={!!error}
              className={error ? 'border-red-500' : ''}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>
        )}
      />

      <FieldError message={error} />
    </div>
  )
}
