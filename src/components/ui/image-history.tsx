"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Clock,
  Eye,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale("fr");

interface ImageHistoryItem {
  id: string;
  originalUrl: string;
  transformedUrl?: string;
  transformationType: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  createdAt: string;
  withFurniture?: boolean;
  customPrompt?: string;
}

interface ImageHistoryProps {
  images: ImageHistoryItem[];
  onView?: (image: ImageHistoryItem) => void;
  onDownload?: (image: ImageHistoryItem) => void;
  onDelete?: (imageId: string) => void;
  maxItems?: number;
}

/**
 * Composant d'historique des transformations d'images
 * Affiche la liste des transformations avec leurs détails
 *
 * @example
 * ```tsx
 * <ImageHistory
 *   images={historyImages}
 *   onView={(img) => setSelectedImage(img)}
 *   onDownload={handleDownload}
 *   maxItems={10}
 * />
 * ```
 */
export function ImageHistory({
  images,
  onView,
  onDownload,
  onDelete,
  maxItems = 10,
}: ImageHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayedImages = expanded ? images : images.slice(0, maxItems);
  const hasMore = images.length > maxItems;

  const getStatusColor = (status: ImageHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: ImageHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'processing':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!onDelete) return;
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
    } finally {
      setDeletingId(null);
    }
  };

  if (images.length === 0) {
    return (
      <Card className="modern-card p-12 text-center">
        <ImageIcon size={48} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Aucune transformation
        </h3>
        <p className="text-sm text-slate-600">
          Vos transformations d&apos;images apparaîtront ici
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Historique des transformations
        </h3>
        <Badge variant="secondary">
          {images.length} transformation{images.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {displayedImages.map((image) => (
          <Card key={image.id} className="modern-card overflow-hidden">
            <div className="flex gap-4 p-4">
              {/* Miniature */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-slate-100">
                <Image
                  src={image.transformedUrl || image.originalUrl}
                  alt="Transformation"
                  fill
                  className="object-cover"
                />
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Détails */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {image.transformationType}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-500">
                        {dayjs(image.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(image.status)}>
                    {getStatusLabel(image.status)}
                  </Badge>
                </div>

                {image.customPrompt && (
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                    {image.customPrompt}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {image.transformedUrl && onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(image)}
                      className="h-7 text-xs"
                    >
                      <Eye size={14} className="mr-1" />
                      Voir
                    </Button>
                  )}
                  {image.transformedUrl && onDownload && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload(image)}
                      className="h-7 text-xs"
                    >
                      <Download size={14} className="mr-1" />
                      Télécharger
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(image.id)}
                      disabled={deletingId === image.id}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-1" />
                      {deletingId === image.id ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bouton Voir plus */}
      {hasMore && (
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} className="mr-2" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown size={16} className="mr-2" />
              Voir {images.length - maxItems} de plus
            </>
          )}
        </Button>
      )}
    </div>
  );
}
