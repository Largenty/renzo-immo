"use client";

import { BackButton } from "../atoms/back-button";

/**
 * Props pour le composant EditProjectHeader
 */
interface EditProjectHeaderProps {
  isLoading?: boolean;
}

/**
 * Composant Molecule - En-tête de la page d'édition de projet
 *
 * Combine le bouton de retour et le titre de la page
 */
export function EditProjectHeader({ isLoading = false }: EditProjectHeaderProps) {
  return (
    <div>
      <div className="mb-4">
        <BackButton href="/dashboard/projects" label="Retour aux projets" disabled={isLoading} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Modifier le projet</h1>
      <p className="text-slate-600 mt-1">
        Mettez à jour les informations du projet
      </p>
    </div>
  );
}
