import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

/**
 * Props pour le composant IconButton
 *
 * @interface IconButtonProps
 * @extends {ButtonHTMLAttributes<HTMLButtonElement>}
 * @property {LucideIcon} icon - Icône Lucide à afficher
 * @property {"default" | "outline" | "ghost" | "danger"} [variant="outline"] - Style du bouton
 * @property {"sm" | "md" | "lg"} [size="sm"] - Taille du bouton
 * @property {string} [tooltip] - Texte du tooltip (aussi utilisé pour aria-label)
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  tooltip?: string;
}

/**
 * Classes Tailwind pour les différentes tailles
 * @private
 */
const sizeClasses = {
  sm: "h-8 w-8 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
};

/**
 * Tailles d'icônes en pixels
 * @private
 */
const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * Classes Tailwind pour les différents variants
 * @private
 */
const variantClasses = {
  default: "",
  outline: "border-slate-300",
  ghost: "border-0",
  danger:
    "hover:bg-red-50 hover:border-red-300 hover:text-red-600 border-slate-300",
};

/**
 * Composant IconButton - Bouton carré avec icône uniquement
 *
 * Bouton optimisé pour afficher une seule icône, avec support de différentes
 * tailles et variants. Inclut aria-label automatique pour l'accessibilité.
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={Edit3}
 *   tooltip="Modifier"
 *   onClick={handleEdit}
 * />
 * <IconButton
 *   icon={Trash2}
 *   variant="danger"
 *   tooltip="Supprimer"
 *   onClick={handleDelete}
 * />
 * ```
 */
export function IconButton({
  icon: Icon,
  variant = "outline",
  size = "sm",
  tooltip,
  className = "",
  ...props
}: IconButtonProps) {
  const buttonVariant = variant === "danger" ? "outline" : variant;

  return (
    <Button
      variant={buttonVariant}
      size="sm"
      className={`${sizeClasses[size]} ${variantClasses[variant]} flex-shrink-0 ${className}`}
      title={tooltip}
      aria-label={tooltip || props['aria-label']}
      {...props}
    >
      <Icon size={iconSizes[size]} aria-hidden="true" />
    </Button>
  );
}
