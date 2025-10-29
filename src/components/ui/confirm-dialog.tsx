import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconClassName = "text-slate-600",
  children,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  confirmVariant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" role="alertdialog" aria-describedby="confirm-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
          {description && <DialogDescription id="confirm-dialog-description">{description}</DialogDescription>}
        </DialogHeader>

        <div className="pt-4 space-y-4">
          {children}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              className={`flex-1 ${
                confirmVariant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : ""
              }`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {Icon && <Icon size={16} className="mr-2" />}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
