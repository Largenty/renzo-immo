"use client";

import { Loader2 } from "lucide-react";

/**
 * Composant Molecule - État de chargement pour l'édition de projet
 *
 * Affiche un spinner centré pendant le chargement
 */
export function EditProjectLoadingState() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    </div>
  );
}
