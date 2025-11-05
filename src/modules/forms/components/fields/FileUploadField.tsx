'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/shared/ui/button'
import { FieldError } from '../FieldError'

interface FileUploadFieldProps {
  name: string
  label: string
  accept?: string
  maxSize?: number
  required?: boolean
  description?: string
  existingFileUrl?: string
}

export function FileUploadField({
  name,
  label,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  required = false,
  description,
  existingFileUrl,
}: FileUploadFieldProps) {
  const { control, formState: { errors }, setValue } = useFormContext()
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const error = errors[name]?.message as string | undefined

  const handleFileChange = (file: File | null, onChange: (value: File | null) => void) => {
    if (!file) {
      setPreview(null)
      onChange(null)
      return
    }

    if (file.size > maxSize) {
      setValue(name, null)
      setPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }

  const handleRemove = (onChange: (value: File | null) => void) => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent, onChange: (value: File | null) => void) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file, onChange)
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="space-y-3">
            {preview || (existingFileUrl && !value) ? (
              <div className="relative rounded-md border border-slate-200 p-3 bg-slate-50">
                <img
                  src={preview || existingFileUrl}
                  alt="Preview"
                  className="max-h-48 rounded-md mx-auto"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(onChange)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                {existingFileUrl && !preview && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Image actuelle (uploadez un nouveau fichier pour remplacer)
                  </p>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, onChange)}
                className={`
                  border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}
                  ${error ? 'border-red-300 bg-red-50' : ''}
                `}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600 mb-1">
                  Glissez-déposez un fichier ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-slate-500">
                  {accept.replace(/,/g, ', ')} (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleFileChange(file, onChange)
                  }}
                  className="hidden"
                  aria-label={label}
                  aria-invalid={!!error}
                />
              </div>
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
