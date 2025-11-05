'use client'

import { useEffect } from 'react'
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
  editProjectSchema,
  type EditProjectFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { useProject, useUpdateProject } from '../hooks/use-projects'
import { useCurrentUser } from '@/modules/auth'

interface EditProjectFormProps {
  projectId: string
}

export function EditProjectForm({ projectId }: EditProjectFormProps) {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(user?.id, projectId)
  const updateProject = useUpdateProject(user?.id)

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: '',
      address: '',
      description: '',
      coverImage: null,
      coverImageUrl: null,
    },
  })

  const { setError } = form

  // Reset form with project data when loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || '',
        address: project.address || '',
        description: project.description || '',
        coverImage: null,
        coverImageUrl: project.coverImageUrl || null,
      })
    }
  }, [project, form])

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<EditProjectFormData>({
    setError,
    onSuccess: () => {
      router.push(`/dashboard/projects/${projectId}`)
    },
    successMessage: 'Projet mis à jour avec succès',
  })

  const onSubmit = async (data: EditProjectFormData) => {
    await handleSubmit(async () => {
      const updateData: any = {
        name: data.name,
        address: data.address || null,
        description: data.description || null,
      }

      if (data.coverImage) {
        updateData.coverImage = data.coverImage
      }

      await updateProject.mutateAsync({
        projectId,
        input: updateData,
        coverImage: data.coverImage || undefined,
      })
    })
  }

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600">Chargement du projet...</span>
      </div>
    )
  }

  if (projectError) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">
          Erreur lors du chargement du projet. Veuillez réessayer.
        </p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm text-yellow-800">Projet introuvable.</p>
      </div>
    )
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
        existingFileUrl={form.watch('coverImageUrl') || undefined}
      />

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting || updateProject.isPending} className="min-w-[120px]">
          {isSubmitting || updateProject.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>

        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || updateProject.isPending}>
          Annuler
        </Button>
      </div>
    </Form>
  )
}
