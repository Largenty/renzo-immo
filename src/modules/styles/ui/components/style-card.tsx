'use client'

import { Card, Button } from '@/shared'
import { Edit, Trash2, Sparkles } from 'lucide-react'

interface StyleCardProps {
  name: string
  description?: string
  iconName?: string
  allowFurniture?: boolean
  onEdit: () => void
  onDelete: () => void
}

export function StyleCard({
  name,
  description,
  allowFurniture,
  onEdit,
  onDelete,
}: StyleCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Sparkles className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{name}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      {allowFurniture && (
        <div className="text-xs text-slate-500">
          Furniture toggle enabled
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          <Edit size={16} className="mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="flex-1 text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} className="mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  )
}
