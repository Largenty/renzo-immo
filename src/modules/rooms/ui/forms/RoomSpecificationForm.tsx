'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  Form,
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  useFormSubmit,
  roomSpecificationSchema,
  type RoomSpecificationFormData,
} from '@/modules/forms'
import { Button } from '@/shared/ui/button'
import { useCreateRoom, useUpdateRoom } from '../hooks/use-rooms'
import type { RoomSpecification } from '../../types'

interface RoomSpecificationFormProps {
  room?: RoomSpecification | null
  onSuccess: () => void
  onCancel: () => void
}

// Types de pièces disponibles depuis l'ENUM de la BDD
const ROOM_TYPE_OPTIONS = [
  { value: 'salon', label: 'Salon' },
  { value: 'chambre', label: 'Chambre' },
  { value: 'cuisine', label: 'Cuisine' },
  { value: 'salle_a_manger', label: 'Salle à Manger' },
  { value: 'salle_de_bain', label: 'Salle de Bain' },
  { value: 'wc', label: 'WC' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'entree', label: 'Entrée' },
  { value: 'couloir', label: 'Couloir' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'balcon', label: 'Balcon' },
  { value: 'jardin', label: 'Jardin' },
  { value: 'garage', label: 'Garage' },
  { value: 'cave', label: 'Cave' },
  { value: 'grenier', label: 'Grenier' },
  { value: 'buanderie', label: 'Buanderie' },
  { value: 'dressing', label: 'Dressing' },
  { value: 'veranda', label: 'Véranda' },
  { value: 'mezzanine', label: 'Mezzanine' },
  { value: 'autre', label: 'Autre' },
]

// Icônes Lucide populaires pour les pièces
const ICON_OPTIONS = [
  { value: 'Home', label: 'Maison (Home)' },
  { value: 'Sofa', label: 'Canapé (Sofa)' },
  { value: 'Bed', label: 'Lit (Bed)' },
  { value: 'UtensilsCrossed', label: 'Couverts (UtensilsCrossed)' },
  { value: 'Bath', label: 'Baignoire (Bath)' },
  { value: 'Droplet', label: 'Goutte (Droplet)' },
  { value: 'Laptop', label: 'Ordinateur (Laptop)' },
  { value: 'DoorOpen', label: 'Porte (DoorOpen)' },
  { value: 'Trees', label: 'Arbres (Trees)' },
  { value: 'Car', label: 'Voiture (Car)' },
  { value: 'Archive', label: 'Archive (Archive)' },
  { value: 'Warehouse', label: 'Entrepôt (Warehouse)' },
  { value: 'Baby', label: 'Bébé (Baby)' },
  { value: 'Gamepad2', label: 'Manette (Gamepad2)' },
  { value: 'Sparkles', label: 'Étincelles (Sparkles)' },
]

export function RoomSpecificationForm({ room, onSuccess, onCancel }: RoomSpecificationFormProps) {
  const createRoomMutation = useCreateRoom()
  const updateRoomMutation = useUpdateRoom()

  const form = useForm<RoomSpecificationFormData>({
    resolver: zodResolver(roomSpecificationSchema),
    defaultValues: {
      roomType: '',
      displayNameFr: '',
      displayNameEn: '',
      constraintsText: '',
      typicalAreaMin: null,
      typicalAreaMax: null,
      description: '',
      iconName: '',
    },
  })

  const { setError } = form

  // Remplir le formulaire si en mode édition
  useEffect(() => {
    if (room) {
      form.reset({
        roomType: room.room_type,
        displayNameFr: room.display_name_fr,
        displayNameEn: room.display_name_en,
        constraintsText: room.constraints_text,
        typicalAreaMin: room.typical_area_min || null,
        typicalAreaMax: room.typical_area_max || null,
        description: room.description || '',
        iconName: room.icon_name || '',
      })
    }
  }, [room, form])

  const { handleSubmit, isSubmitting, globalError } = useFormSubmit<RoomSpecificationFormData>({
    setError,
    onSuccess,
    successMessage: room ? 'Pièce mise à jour avec succès' : 'Pièce créée avec succès',
  })

  const onSubmit = async (data: RoomSpecificationFormData) => {
    await handleSubmit(async () => {
      if (room) {
        // Mode édition - ne pas envoyer room_type (non modifiable)
        const updateInput = {
          display_name_fr: data.displayNameFr,
          display_name_en: data.displayNameEn,
          constraints_text: data.constraintsText,
          typical_area_min: data.typicalAreaMin,
          typical_area_max: data.typicalAreaMax,
          description: data.description || undefined,
          icon_name: data.iconName || undefined,
        }

        await updateRoomMutation.mutateAsync({
          roomId: room.id,
          input: updateInput,
        })
      } else {
        // Mode création - envoyer room_type
        const createInput = {
          room_type: data.roomType,
          display_name_fr: data.displayNameFr,
          display_name_en: data.displayNameEn,
          constraints_text: data.constraintsText,
          typical_area_min: data.typicalAreaMin,
          typical_area_max: data.typicalAreaMax,
          description: data.description || undefined,
          icon_name: data.iconName || undefined,
        }

        await createRoomMutation.mutateAsync(createInput)
      }
    })
  }

  return (
    <Form form={form} onSubmit={onSubmit} globalError={globalError} className="space-y-6">
      {/* Afficher le sélecteur de type uniquement en mode création */}
      {!room && (
        <SelectField
          name="roomType"
          label="Type de pièce"
          options={ROOM_TYPE_OPTIONS}
          placeholder="Sélectionner un type"
          required
          description="Choisissez le type de pièce (vous pourrez créer votre propre version personnalisée)"
        />
      )}

      {/* Afficher le type de pièce en lecture seule en mode édition */}
      {room && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Type de pièce
          </label>
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
            {ROOM_TYPE_OPTIONS.find(opt => opt.value === room.room_type)?.label || room.room_type}
          </div>
          <p className="text-sm text-slate-500">Le type de pièce ne peut pas être modifié</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          name="displayNameFr"
          label="Nom français"
          placeholder="Ex: Mon Salon Personnalisé"
          required
          autoFocus
          maxLength={100}
          description="Nom affiché en français"
        />

        <TextField
          name="displayNameEn"
          label="Nom anglais"
          placeholder="Ex: My Custom Living Room"
          required
          maxLength={100}
          description="Nom affiché en anglais"
        />
      </div>

      <TextareaField
        name="constraintsText"
        label="Contraintes architecturales"
        placeholder="Décrivez les contraintes à respecter pour cette pièce (ex: position des fenêtres, plomberie fixe, etc.)"
        rows={5}
        required
        maxLength={2000}
        description="Ces contraintes guideront l'IA lors des transformations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberField
          name="typicalAreaMin"
          label="Surface minimale (m²)"
          placeholder="Ex: 12"
          min={0}
          max={1000}
          step={0.5}
          description="Optionnel"
        />

        <NumberField
          name="typicalAreaMax"
          label="Surface maximale (m²)"
          placeholder="Ex: 25"
          min={0}
          max={1000}
          step={0.5}
          description="Optionnel"
        />
      </div>

      <SelectField
        name="iconName"
        label="Icône"
        options={ICON_OPTIONS}
        placeholder="Choisir une icône (optionnel)"
        description="Icône affichée dans l'interface"
      />

      <TextareaField
        name="description"
        label="Description"
        placeholder="Description supplémentaire de la pièce..."
        rows={3}
        maxLength={500}
        description="Optionnel"
      />

      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || createRoomMutation.isPending || updateRoomMutation.isPending}
          className="min-w-[120px]"
        >
          {isSubmitting || createRoomMutation.isPending || updateRoomMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {room ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            <>{room ? 'Mettre à jour' : 'Créer la pièce'}</>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || createRoomMutation.isPending || updateRoomMutation.isPending}
        >
          Annuler
        </Button>
      </div>
    </Form>
  )
}
