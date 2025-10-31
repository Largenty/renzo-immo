"use client";

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
import { useSignOut } from "@/domain/auth";
import { logger } from '@/lib/logger';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const signOutMutation = useSignOut();

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();
      // Le hook gère automatiquement la redirection et les messages
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook
      logger.error('Logout error:', error);
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
            disabled={signOutMutation.isPending}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={signOutMutation.isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {signOutMutation.isPending ? (
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
