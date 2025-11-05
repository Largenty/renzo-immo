'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Label,
} from '@/shared'

interface StyleFormData {
  name: string
  description: string
  allowFurnitureToggle: boolean
}

interface StyleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  style?: StyleFormData | null
  onSubmit: (data: StyleFormData) => void
  isSubmitting?: boolean
}

export function StyleFormDialog({
  open,
  onOpenChange,
  style,
  onSubmit,
  isSubmitting,
}: StyleFormDialogProps) {
  const [formData, setFormData] = useState<StyleFormData>({
    name: '',
    description: '',
    allowFurnitureToggle: false,
  })

  useEffect(() => {
    if (style) {
      setFormData(style)
    } else {
      setFormData({
        name: '',
        description: '',
        allowFurnitureToggle: false,
      })
    }
  }, [style, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {style ? 'Edit Style' : 'Create New Style'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Style name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Style description"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowFurniture"
              checked={formData.allowFurnitureToggle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowFurnitureToggle: e.target.checked,
                })
              }
            />
            <Label htmlFor="allowFurniture">Allow furniture toggle</Label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : style ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
