"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, User, Building, CheckCircle2, Loader2 } from "lucide-react";
import { FormField } from "../atoms/form-field";
import { PasswordFieldGroup } from "../molecules/password-field-group";
import { SocialAuthSection } from "../molecules/social-auth-section";
import Link from "next/link";

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company?: string;
  acceptTerms: boolean;
}

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  isLoading?: boolean;
}

export function SignupForm({ onSubmit, onGoogleSignIn, isLoading = false }: SignupFormProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
    acceptTerms: false,
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Prénom"
            type="text"
            name="firstName"
            placeholder="Jean"
            icon={User}
            value={formData.firstName}
            onChange={handleChange}
            required
            autoComplete="given-name"
          />

          <FormField
            label="Nom"
            type="text"
            name="lastName"
            placeholder="Dupont"
            icon={User}
            value={formData.lastName}
            onChange={handleChange}
            required
            autoComplete="family-name"
          />
        </div>

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

        <FormField
          label="Entreprise (optionnel)"
          type="text"
          name="company"
          placeholder="Nom de votre agence"
          icon={Building}
          value={formData.company}
          onChange={handleChange}
          autoComplete="organization"
        />

        <PasswordFieldGroup
          password={formData.password}
          onPasswordChange={handleChange}
          confirmPassword={formData.confirmPassword}
          onConfirmPasswordChange={handleChange}
          showStrength={true}
          showConfirm={true}
        />

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900">
              J&apos;accepte les{" "}
              <Link
                href="/legal/terms"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                conditions d&apos;utilisation
              </Link>{" "}
              et la{" "}
              <Link
                href="/legal/privacy"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                politique de confidentialité
              </Link>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={20} className="mr-2 animate-spin" />
          ) : (
            <CheckCircle2 size={20} className="mr-2" />
          )}
          {isLoading ? "Création du compte..." : "Créer mon compte"}
        </Button>
      </form>

      <SocialAuthSection
        onGoogleSignIn={handleGoogleSignIn}
        isGoogleLoading={isGoogleLoading}
        disabled={isLoading}
      />

      <p className="text-center text-sm text-slate-600">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/auth/login"
          className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md btn-glow transition-all duration-300 shadow-lg"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
