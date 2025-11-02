"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, AuthLoading } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Erreur", {
        description: "Veuillez saisir votre adresse email",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (error) {
        toast.error("Erreur", {
          description: error.message || "Impossible d'envoyer l'email",
        });
      } else {
        setEmailSent(true);
        toast.success("Email envoyé !", {
          description: "Vérifiez votre boîte de réception",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  if (emailSent) {
    return (
      <AuthCard
        title="Email envoyé !"
        subtitle="Vérifiez votre boîte de réception"
      >
        <div className="space-y-6">
          {/* Icon et Message */}
          <div className="py-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Email envoyé avec succès
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-600">
              Nous avons envoyé un lien de réinitialisation à{" "}
              <span className="font-medium text-slate-900">{email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              1. Ouvrez l'email et cliquez sur le lien de réinitialisation
            </p>
            <p className="text-sm text-slate-700">
              2. Le lien est valide pendant 1 heure
            </p>
            <p className="text-sm text-slate-700">
              3. Pensez à vérifier vos spams si vous ne le voyez pas
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Retour à la connexion
            </Button>

            <Button
              onClick={() => setEmailSent(false)}
              variant="ghost"
              className="w-full"
            >
              Renvoyer l'email
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Mot de passe oublié ?"
      subtitle="Nous allons vous envoyer un lien de réinitialisation"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Envoyer le lien de réinitialisation"
          )}
        </Button>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLoading
          title="Mot de passe oublié ?"
          subtitle="Chargement..."
        />
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
