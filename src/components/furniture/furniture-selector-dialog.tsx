'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles } from 'lucide-react'
import { logger } from '@/lib/logger'

interface FurnitureItem {
  id: string
  category: string
  name_fr: string
  name_en: string
  is_essential: boolean
  priority: number
  variant: {
    description: string
    materials: string[]
    colors: string[]
  } | null
}

interface FurnitureSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transformationTypeId: string
  roomType: string
  onSelect: (furnitureIds: string[]) => void
  initialSelection?: string[]
}

export function FurnitureSelectorDialog({
  open,
  onOpenChange,
  transformationTypeId,
  roomType,
  onSelect,
  initialSelection = [],
}: FurnitureSelectorDialogProps) {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [defaultPreset, setDefaultPreset] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger le catalogue au montage
  useEffect(() => {
    if (open && transformationTypeId && roomType) {
      logger.debug('[FurnitureSelectorDialog] Opening with params:', {
        transformationTypeId,
        roomType,
        initialSelection,
      });
      loadFurnitureCatalog()
    }
  }, [open, transformationTypeId, roomType])

  // Initialiser la sélection
  useEffect(() => {
    if (initialSelection.length > 0) {
      setSelectedIds(initialSelection)
    } else if (defaultPreset.length > 0 && selectedIds.length === 0) {
      // Si aucune sélection initiale, utiliser le preset par défaut
      setSelectedIds(defaultPreset)
    }
  }, [initialSelection, defaultPreset])

  async function loadFurnitureCatalog() {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        transformationTypeId,
        roomType,
      })

      const response = await fetch(`/api/furniture/catalog?${params}`)

      if (!response.ok) {
        throw new Error('Failed to load furniture catalog')
      }

      const data = await response.json()
      setFurniture(data.furniture || [])
      setDefaultPreset(data.defaultPreset || [])

      logger.info('Furniture catalog loaded', {
        furnitureCount: data.furniture?.length || 0,
        hasPreset: data.defaultPreset?.length > 0,
      })
    } catch (err) {
      logger.error('Error loading furniture catalog', { error: err })
      setError('Impossible de charger le catalogue de meubles')
    } finally {
      setLoading(false)
    }
  }

  function toggleFurniture(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    )
  }

  function handleUseDefaultPreset() {
    setSelectedIds(defaultPreset)
  }

  function handleSelectAll() {
    setSelectedIds(furniture.map(f => f.id))
  }

  function handleClearAll() {
    setSelectedIds([])
  }

  function handleConfirm() {
    // 🐛 DEBUG: Log la confirmation
    logger.debug('[FurnitureSelectorDialog] Confirming selection:', {
      selectedCount: selectedIds.length,
      selectedIds,
    });

    onSelect(selectedIds)
    onOpenChange(false)
  }

  // Grouper les meubles par catégorie
  const furnitureByCategory = furniture.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, FurnitureItem[]>)

  const categoryLabels: Record<string, string> = {
    seating: 'Assises',
    table: 'Tables',
    storage: 'Rangement',
    bed: 'Literie',
    lighting: 'Éclairage',
    decor: 'Décoration',
    appliance: 'Électroménager',
    fixture: 'Équipements',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personnaliser les meubles</DialogTitle>
          <DialogDescription>
            Sélectionnez les meubles à inclure dans votre transformation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              onClick={loadFurnitureCatalog}
              variant="outline"
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {/* Actions rapides */}
            <div className="flex flex-wrap gap-2 pb-4 border-b">
              {defaultPreset.length > 0 && (
                <Button
                  onClick={handleUseDefaultPreset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Utiliser le preset par défaut
                </Button>
              )}
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
              >
                Tout sélectionner
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
              >
                Tout désélectionner
              </Button>
              <div className="ml-auto text-sm text-muted-foreground">
                {selectedIds.length} meuble{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Liste des meubles par catégorie */}
            <div className="space-y-6">
              {Object.entries(furnitureByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-semibold text-sm mb-3">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => toggleFurniture(item.id)}
                        />
                        <label
                          htmlFor={item.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {item.name_fr}
                            </span>
                            {item.is_essential && (
                              <Badge variant="secondary" className="text-xs">
                                Essentiel
                              </Badge>
                            )}
                          </div>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.variant.description}
                            </p>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
              >
                Annuler
              </Button>
              <Button onClick={handleConfirm}>
                Confirmer ({selectedIds.length})
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
