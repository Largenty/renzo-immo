'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Switch } from '@/shared/ui/switch'
import { FieldError } from '../FieldError'

interface SwitchFieldProps {
  name: string
  label: string
  description?: string
}

export function SwitchField({ name, label, description }: SwitchFieldProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-2">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <label htmlFor={name} className="text-sm font-medium text-slate-700">
                {label}
              </label>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <Switch
              id={name}
              checked={value}
              onCheckedChange={onChange}
              aria-label={label}
            />
          </div>
        )}
      />

      <FieldError message={error} />
    </div>
  )
}
