"use client";

import { Button } from "@/shared";
import { ArrowLeft, Archive, Upload, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared";
import { ShareProjectDialog } from "@/modules/projects";

interface ProjectHeaderProps {
  projectId?: string;
  projectName: string;
  address?: string;
  description?: string;
  isExporting: boolean;
  canExport: boolean;
  onExport: () => void;
  uploadDialogOpen: boolean;
  onUploadDialogChange: (open: boolean) => void;
  uploadDialogContent: React.ReactNode;
  onDelete?: () => void;
  // Showcase props
  projectSlug?: string;
  userDisplayName?: string;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}

export function ProjectHeader({
  projectId,
  projectName,
  address,
  description,
  isExporting,
  canExport,
  onExport,
  uploadDialogOpen,
  onUploadDialogChange,
  uploadDialogContent,
  onDelete,
  projectSlug,
  userDisplayName,
  isPublic = false,
  onTogglePublic,
}: ProjectHeaderProps) {
  return (
    <div>
      <Link href="/dashboard/projects">
        <Button variant="ghost" className="mb-4 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} className="mr-2" />
          Retour aux projets
        </Button>
      </Link>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{projectName}</h1>
          {address && <p className="text-slate-600 mt-1">{address}</p>}
          {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
        </div>
        <div className="flex gap-2 flex-wrap relative z-50">
          {projectId && (
            <>
              <Link href={`/dashboard/projects/${projectId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit size={16} className="mr-2" />
                  Modifier
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </Button>
              )}
            </>
          )}
          <Button
            onClick={onExport}
            disabled={isExporting || !canExport}
            variant="outline"
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Archive size={20} className="mr-2" />
                Exporter en ZIP
              </>
            )}
          </Button>

          {/* Share Button */}
          {projectId && projectSlug && userDisplayName && (
            <ShareProjectDialog
              projectId={projectId}
              projectName={projectName}
              projectSlug={projectSlug}
              userDisplayName={userDisplayName}
              isPublic={isPublic}
              onTogglePublic={onTogglePublic}
            />
          )}

          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 btn-glow relative z-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              logger.debug('🖱️ Upload button clicked');
              onUploadDialogChange(true);
            }}
            type="button"
          >
            <Upload size={20} className="mr-2" />
            Ajouter des photos
          </Button>

          <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
            logger.debug('🔄 Dialog onOpenChange called with:', open);
            onUploadDialogChange(open);
          }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Ajouter des photos</DialogTitle>
                <DialogDescription>
                  Téléchargez vos photos immobilières et choisissez le type de transformation
                </DialogDescription>
              </DialogHeader>
              <div className="pt-4">{uploadDialogContent}</div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
