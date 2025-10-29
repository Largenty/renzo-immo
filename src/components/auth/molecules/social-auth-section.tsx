"use client";

import { Separator } from "@/components/ui/separator";
import { SocialButton } from "../atoms/social-button";
import { Chrome } from "lucide-react";

interface SocialAuthSectionProps {
  onGoogleSignIn: () => void;
  isGoogleLoading?: boolean;
  disabled?: boolean;
}

export function SocialAuthSection({
  onGoogleSignIn,
  isGoogleLoading = false,
  disabled = false,
}: SocialAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-500">ou</span>
        </div>
      </div>

      <SocialButton
        provider="Google"
        icon={Chrome}
        onClick={onGoogleSignIn}
        isLoading={isGoogleLoading}
        disabled={disabled}
      />
    </div>
  );
}
