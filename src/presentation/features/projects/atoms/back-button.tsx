"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/presentation/shared/ui/button";

/**
 * Props pour le composant BackButton
 */
interface BackButtonProps {
  href: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Composant Atom - Bouton de retour avec icône
 *
 * Bouton réutilisable pour la navigation retour dans l'application
 */
export function BackButton({
  href,
  label = "Retour",
  disabled = false
}: BackButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className="text-slate-600 hover:text-slate-900"
        disabled={disabled}
      >
        <ArrowLeft size={16} className="mr-2" />
        {label}
      </Button>
    </Link>
  );
}
