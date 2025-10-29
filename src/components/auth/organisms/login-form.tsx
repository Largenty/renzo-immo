"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { FormField } from "../atoms/form-field";
import { PasswordFieldGroup } from "../molecules/password-field-group";
import { SocialAuthSection } from "../molecules/social-auth-section";
import Link from "next/link";

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, onGoogleSignIn, isLoading = false }: LoginFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          name="email"
          placeholder="votre@email.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        <PasswordFieldGroup
          password={formData.password}
          onPasswordChange={handleChange}
          showStrength={false}
          showConfirm={false}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600">Se souvenir de moi</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <ArrowRight size={20} className="mr-2" />
          )}
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <SocialAuthSection
        onGoogleSignIn={handleGoogleSignIn}
        isGoogleLoading={isGoogleLoading}
        disabled={isLoading}
      />

      <p className="text-center text-sm text-slate-600">
        Pas encore de compte ?{" "}
        <Link
          href="/auth/signup"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
