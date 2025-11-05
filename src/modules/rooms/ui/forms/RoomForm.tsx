'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  Form,
  TextField,
  TextareaField,
  SelectField,
  FileUploadField,
  useFormSubmit,
  roomSchema,
  type RoomFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'

interface RoomFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

// Temporary: hardcoded room types until the hook is created
const ROOM_TYPES = [
  { id: 'salon', displayNameFr: 'Salon', name: 'Salon' },
  { id: 'cuisine', displayNameFr: 'Cuisine', name: 'Cuisine' },
  { id: 'chambre', displayNameFr: 'Chambre', name: 'Chambre' },
  { id: 'salle-de-bain', displayNameFr: 'Salle de bain', name: 'Salle de bain' },
  { id: 'bureau', displayNameFr: 'Bureau', name: 'Bureau' },
]

export function RoomForm({ projectId, onSuccess, onCancel }: RoomFormProps) {
  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      roomType: '',
      description: '',
      originalImage: null,
    },
  })

  const { setError } = form

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<RoomFormData>({
    setError,
    onSuccess,
    successMessage: 'Pièce créée avec succès',
  })

  const onSubmit = async (data: RoomFormData) => {
    await handleSubmit(async () => {
      // TODO: Implement createRoom mutation
      console.log('Creating room:', { ...data, projectId })
    })
  }

  const roomTypeOptions = ROOM_TYPES.map((type) => ({
    value: type.id,
    label: type.displayNameFr || type.name,
  }))

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      <TextField
        name="name"
        label="Nom de la pièce"
        placeholder="Ex: Salon principal"
        required
        autoFocus
        maxLength={100}
      />

      <SelectField
        name="roomType"
        label="Type de pièce"
        options={roomTypeOptions}
        placeholder="Sélectionner un type"
        required
        description="Le type de pièce détermine les transformations disponibles"
      />

      <TextareaField
        name="description"
        label="Description"
        placeholder="Notes ou informations complémentaires..."
        rows={3}
        maxLength={500}
      />

      <FileUploadField
        name="originalImage"
        label="Photo de la pièce"
        accept="image/jpeg,image/png,image/webp"
        maxSize={10 * 1024 * 1024}
        description="Formats acceptés : JPEG, PNG, WebP (max 10MB)"
      />

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            'Créer la pièce'
          )}
        </Button>

        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
      </div>
    </Form>
  )
}
