'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared'
import { RoomSpecificationForm } from '../forms/RoomSpecificationForm'
import type { RoomSpecification } from '../../types'

interface RoomFormDialogProps {
  open: boolean
  onClose: () => void
  room?: RoomSpecification | null
}

export function RoomFormDialog({ open, onClose, room }: RoomFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? 'Modifier le type de pièce' : 'Créer un type de pièce personnalisé'}
          </DialogTitle>
          <DialogDescription>
            {room
              ? 'Modifiez les spécifications de ce type de pièce.'
              : 'Créez votre propre version personnalisée d\'un type de pièce existant.'}
          </DialogDescription>
        </DialogHeader>
        <RoomSpecificationForm room={room} onSuccess={onClose} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
