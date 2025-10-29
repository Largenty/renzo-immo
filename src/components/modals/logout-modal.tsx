"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/actions";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const result = await signOut();

      if (result && !result.success) {
        toast.error("Erreur", {
          description: result.error || "Impossible de se déconnecter",
        });
        setIsLoggingOut(false);
      }
      // Si succès, signOut() redirige automatiquement vers /auth/login
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la déconnexion",
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-md bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <DialogTitle className="text-xl">Déconnexion</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Êtes-vous sûr de vouloir vous déconnecter de votre compte Renzo ?
            Vous devrez vous reconnecter pour accéder à nouveau à votre espace.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoggingOut}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Déconnexion...
              </>
            ) : (
              <>
                <LogOut size={16} className="mr-2" />
                Se déconnecter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
