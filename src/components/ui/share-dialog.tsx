"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Share2,
  Mail,
  MessageCircle,
  Globe,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  shareUrl: string;
  isPublic?: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
}

/**
 * Dialog de partage avec options de copie et partage social
 *
 * @example
 * ```tsx
 * <ShareDialog
 *   open={shareOpen}
 *   onOpenChange={setShareOpen}
 *   title="Mon Projet"
 *   shareUrl="https://example.com/project/123"
 *   isPublic={true}
 *   onTogglePublic={handleTogglePublic}
 * />
 * ```
 */
export function ShareDialog({
  open,
  onOpenChange,
  title,
  shareUrl,
  isPublic = false,
  onTogglePublic,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié", {
        description: "Le lien a été copié dans le presse-papier",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de copier le lien",
      });
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Découvrez : ${title}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nJe voulais partager ce projet avec vous :\n\n${shareUrl}\n\nCordialement`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Découvrez : ${title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareWeb = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Découvrez : ${title}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        logger.debug("Share cancelled or failed:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Partager
          </DialogTitle>
          <DialogDescription>
            Partagez ce projet avec d&apos;autres personnes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Visibilité */}
          {onTogglePublic && (
            <div className="flex items-center justify-between p-4 rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe size={20} className="text-blue-600" />
                ) : (
                  <Lock size={20} className="text-slate-600" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isPublic ? "Projet public" : "Projet privé"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {isPublic
                      ? "Visible par toute personne avec le lien"
                      : "Visible uniquement par vous"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTogglePublic(!isPublic)}
              >
                {isPublic ? "Rendre privé" : "Rendre public"}
              </Button>
            </div>
          )}

          {/* Lien de partage */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Lien de partage
            </Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Options de partage */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Partager via
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={handleShareEmail}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Mail size={20} className="text-slate-600" />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <MessageCircle size={20} className="text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShareWeb}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Share2 size={20} className="text-blue-600" />
                <span className="text-xs">Plus</span>
              </Button>
            </div>
          </div>

          {/* Note de sécurité */}
          {isPublic && (
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Note :</strong> Toute personne avec ce lien pourra voir
                ce projet et ses images.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
