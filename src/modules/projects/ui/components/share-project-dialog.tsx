"use client";

import { useState, useEffect } from "react";
import { Check, Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import { Button } from "@/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared";
import { Input } from "@/shared";
import { Label } from "@/shared";
import { Switch } from "@/shared";
import { toast } from "sonner";

interface ShareProjectDialogProps {
  projectId: string;
  projectName: string;
  projectSlug: string;
  userDisplayName: string;
  isPublic: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareProjectDialog({
  projectId,
  projectName,
  projectSlug,
  userDisplayName,
  isPublic,
  onTogglePublic,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ShareProjectDialogProps) {
  const [copied, setCopied] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [optimisticIsPublic, setOptimisticIsPublic] = useState(isPublic);

  // Sync optimistic state with prop when it changes
  useEffect(() => {
    setOptimisticIsPublic(isPublic);
  }, [isPublic]);

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Generate showcase URL
  const showcaseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/showcase/${userDisplayName}/${projectSlug}`
      : "";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(showcaseUrl);
      setCopied(true);
      toast.success("Lien copié dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(showcaseUrl, "_blank");
  };

  const handleTogglePublic = async () => {
    if (!onTogglePublic) return;

    const newPublicState = !optimisticIsPublic;

    // Update optimistic state immediately for instant UI feedback
    setOptimisticIsPublic(newPublicState);

    // Call parent handler
    onTogglePublic(newPublicState);

    if (newPublicState) {
      toast.success("Projet publié ! Le lien de partage est maintenant actif.");
    } else {
      toast.info("Projet rendu privé. Le lien de partage n'est plus accessible.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Share2 size={16} />
            Partager
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Partager le projet</DialogTitle>
          <DialogDescription>
            Partagez ce projet avec vos clients via un lien public élégant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-1">
              <Label htmlFor="public-toggle" className="text-sm font-semibold text-slate-900">
                Accès public
              </Label>
              <p className="text-xs text-slate-600 mt-1">
                {optimisticIsPublic
                  ? "Ce projet est accessible via le lien de partage"
                  : "Ce projet est privé et n'est pas accessible publiquement"}
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={optimisticIsPublic}
              onCheckedChange={handleTogglePublic}
              disabled={!onTogglePublic}
            />
          </div>

          {/* URL Display */}
          {optimisticIsPublic ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="showcase-url" className="text-sm font-medium">
                  Lien de partage
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="showcase-url"
                    value={showcaseUrl}
                    readOnly
                    className="font-mono text-sm flex-1"
                  />
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Partagez ce lien avec vos clients pour leur montrer le projet
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleOpenInNewTab}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ExternalLink size={16} />
                  Prévisualiser
                </Button>
                <Button onClick={handleCopyUrl} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copier le lien
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-1">{projectName}</p>
                    <p className="text-xs text-slate-600 truncate">
                      showcase/{userDisplayName}/{projectSlug}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Note :</strong> Seules les images complètement transformées sont visibles
                  sur la page publique. L'adresse et la description du projet restent privées.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Activez l'accès public pour partager ce projet
              </p>
              <Button
                onClick={handleTogglePublic}
                disabled={!onTogglePublic}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Rendre le projet public
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
