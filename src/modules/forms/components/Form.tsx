'use client'

import { FormProvider, type UseFormReturn, type FieldValues } from 'react-hook-form'
import { FormError } from './FormError'

interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues, any, any>
  onSubmit: (data: TFieldValues) => void | Promise<void>
  children: React.ReactNode
  className?: string
  globalError?: string | null
}

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className = '',
  globalError,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate>
        {globalError && <FormError message={globalError} />}
        {children}
      </form>
    </FormProvider>
  )
}
