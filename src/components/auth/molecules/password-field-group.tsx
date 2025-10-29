"use client";

import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { PasswordInput } from "../atoms/password-input";
import { PasswordStrength } from "./password-strength";

interface PasswordFieldGroupProps {
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmPassword?: string;
  onConfirmPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showStrength?: boolean;
  showConfirm?: boolean;
}

export function PasswordFieldGroup({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showStrength = false,
  showConfirm = false,
}: PasswordFieldGroupProps) {
  const passwordsMatch =
    showConfirm &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  return (
    <div className="space-y-4">
      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 font-medium">
          Mot de passe
        </Label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
          />
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={onPasswordChange}
            className="h-12 pl-11"
            required
          />
        </div>
        {showStrength && <PasswordStrength password={password} />}
      </div>

      {/* Confirm password field */}
      {showConfirm && onConfirmPasswordChange && (
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-slate-700 font-medium"
          >
            Confirmer le mot de passe
          </Label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
            />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword || ""}
              onChange={onConfirmPasswordChange}
              className="h-12 pl-11"
              required
            />
          </div>
          {passwordsMatch && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              ✓ Les mots de passe correspondent
            </p>
          )}
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>
      )}
    </div>
  );
}
