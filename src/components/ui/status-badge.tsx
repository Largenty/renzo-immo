import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";

/**
 * Type définissant les statuts possibles pour une image
 *
 * @typedef {("completed" | "pending" | "processing" | "failed")} StatusType
 */
export type StatusType = "completed" | "pending" | "processing" | "failed";

/**
 * Props pour le composant StatusBadge
 *
 * @interface StatusBadgeProps
 * @property {StatusType} status - Statut à afficher
 * @property {string} [className] - Classes CSS additionnelles
 */
interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * Configuration des statuts avec icônes, labels et styles
 * @private
 */
const statusConfig = {
  completed: {
    icon: Check,
    label: "Terminé",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  processing: {
    icon: Loader2,
    label: "En cours",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    animated: true,
  },
  failed: {
    icon: AlertCircle,
    label: "Échec",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

/**
 * Composant StatusBadge - Badge coloré avec icône pour afficher le statut d'une image
 *
 * Affiche automatiquement la bonne couleur, icône et animation selon le statut.
 * Inclut des attributs ARIA pour l'accessibilité.
 *
 * @example
 * ```tsx
 * <StatusBadge status="completed" />
 * <StatusBadge status="processing" />
 * <StatusBadge status="failed" className="ml-2" />
 * ```
 */
export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${config.className} ${className}`}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      <Icon
        size={12}
        className={`mr-1 ${config.animated ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
