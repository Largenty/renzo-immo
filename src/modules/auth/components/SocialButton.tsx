"use client";

import { Button } from "@/presentation/shared/ui/button";
import { Loader2, LucideIcon } from "lucide-react";

interface SocialButtonProps {
  provider: string;
  icon: LucideIcon;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SocialButton({
  provider,
  icon: Icon,
  onClick,
  isLoading = false,
  disabled = false,
}: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 text-slate-700 border-slate-300 hover:bg-slate-50"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 size={20} className="mr-2 animate-spin" />
      ) : (
        <Icon size={20} className="mr-2" />
      )}
      Continuer avec {provider}
    </Button>
  );
}
