'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import {
  Form,
  TextField,
  TextareaField,
  FileUploadField,
  useFormSubmit,
  createProjectSchema,
  type CreateProjectFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { useCreateProject } from '../hooks/use-projects'
import { useCurrentUser } from '@/modules/auth'

export function NewProjectForm() {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const createProject = useCreateProject(user?.id)

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
      coverImage: null,
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<CreateProjectFormData>({
    setError,
    onSuccess: () => {
      router.push('/dashboard/projects')
    },
    successMessage: 'Projet créé avec succès',
  })

  const onSubmit = async (data: CreateProjectFormData) => {
    await handleSubmit(async () => {
      await createProject.mutateAsync({
        name: data.name,
        address: data.address || undefined,
        description: data.description || undefined,
        coverImage: data.coverImage || undefined,
      })
    })
  }

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      <TextField
        name="name"
        label="Nom du projet"
        placeholder="Ex: Appartement 3 pièces Lyon 6ème"
        required
        autoFocus
        maxLength={100}
        description="Un nom descriptif pour identifier facilement votre projet"
      />

      <TextField
        name="address"
        label="Adresse"
        placeholder="Ex: 12 rue de la République, 69006 Lyon"
        maxLength={200}
        description="Adresse du bien (optionnel)"
      />

      <TextareaField
        name="description"
        label="Description"
        placeholder="Décrivez votre projet en quelques mots..."
        rows={4}
        maxLength={500}
        description="Informations complémentaires sur le projet (optionnel)"
      />

      <FileUploadField
        name="coverImage"
        label="Image de couverture"
        accept="image/jpeg,image/png,image/webp"
        maxSize={5 * 1024 * 1024}
        description="Formats acceptés : JPEG, PNG, WebP (max 5MB)"
      />

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting || createProject.isPending} className="min-w-[120px]">
          {isSubmitting || createProject.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            'Créer le projet'
          )}
        </Button>

        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || createProject.isPending}>
          Annuler
        </Button>
      </div>
    </Form>
  )
}
