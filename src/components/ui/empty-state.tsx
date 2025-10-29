import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/**
 * Props pour le composant EmptyState
 *
 * @interface EmptyStateProps
 * @property {LucideIcon} icon - Icône à afficher
 * @property {string} title - Titre principal
 * @property {string} description - Description détaillée
 * @property {object} [action] - Action optionnelle avec bouton
 * @property {string} action.label - Label du bouton
 * @property {() => void} action.onClick - Callback au clic
 * @property {string} [className] - Classes CSS additionnelles
 */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Composant EmptyState - Affiche un état vide élégant avec icône et action
 *
 * Utilisé pour afficher un message lorsqu'il n'y a pas de contenu à afficher.
 * Inclut un rôle ARIA "status" pour l'accessibilité.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FolderOpen}
 *   title="Aucun projet"
 *   description="Créez votre premier projet pour commencer"
 *   action={{
 *     label: "Créer un projet",
 *     onClick: () => router.push('/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`modern-card p-12 text-center ${className}`} role="status" aria-live="polite">
      <Icon size={48} className="text-slate-400 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}
