"use client";

import { useState, useCallback } from "react";
import { User, CreditCard, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores";
import { useCurrentUser } from "@/domain/auth";
import { SettingsTabs } from "@/components/dashboard/molecules/settings-tabs";
import { validatePassword } from "@/lib/validators/password-validator";
import { logger } from "@/lib/logger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ProfileSettingsSection,
  type ProfileFormData,
} from "@/components/dashboard/organisms/profile-settings-section";
import { AccountSettingsSection } from "@/components/dashboard/organisms/account-settings-section";
import { BillingSettingsSection } from "@/components/dashboard/organisms/billing-settings-section";

export default function SettingsPage() {
  const router = useRouter();
  const { user: storeUser, updateUser } = useAuthStore();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "account", label: "Compte", icon: Shield },
    { id: "billing", label: "Facturation", icon: CreditCard },
  ];

  // ✅ Memoize: Handle profile save
  const handleProfileSave = useCallback(async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour mettre à jour votre profil");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Mise à jour du profil...");

    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        address: data.address,
      });

      toast.success("Profil mis à jour avec succès", { id: toastId });
    } catch (error) {
      logger.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil", {
        id: toastId,
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, updateUser]);

  // ✅ Memoize: Handle email change
  const handleEmailChange = useCallback(async (newEmail: string) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour changer votre email");
      return;
    }

    // Validation basique de l'email
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Adresse email invalide");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Changement d'email en cours...");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast.success("Email de confirmation envoyé", {
        id: toastId,
        description: "Vérifiez votre nouvelle adresse email pour confirmer le changement",
      });
    } catch (error) {
      logger.error("Error changing email:", error);
      toast.error("Erreur lors du changement d'email", {
        id: toastId,
        description: error instanceof Error ? error.message : "Impossible de changer l'adresse email",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  // ✅ Memoize: Handle password change
  const handlePasswordChange = useCallback(async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour changer votre mot de passe");
      return;
    }

    // Validation - mots de passe correspondent
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // ✅ Utiliser le helper centralisé pour la validation
    const validation = validatePassword(data.newPassword);
    if (!validation.valid) {
      toast.error("Mot de passe invalide", {
        description: validation.errors[0] || "Le mot de passe ne respecte pas les critères de sécurité",
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Changement de mot de passe...");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // ✅ Vérifier le mot de passe actuel avant de le changer
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: data.currentPassword,
      });

      if (signInError) {
        throw new Error("Le mot de passe actuel est incorrect");
      }

      // Changer le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès", { id: toastId });
    } catch (error) {
      logger.error("Error changing password:", error);
      toast.error("Erreur lors du changement de mot de passe", {
        id: toastId,
        description: error instanceof Error ? error.message : "Impossible de changer le mot de passe",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, user?.email]);

  // ✅ Memoize: Demo handlers (billing section)
  const handleDeleteAccount = useCallback(() => {
    toast.error("Action non disponible en démo");
  }, []);

  const handleChangePlan = useCallback(() => {
    toast.info("Changement de forfait à venir");
  }, []);

  const handleCancelSubscription = useCallback(() => {
    toast.error("Action non disponible en démo");
  }, []);

  const handleUpdatePayment = useCallback(() => {
    toast.info("Modification de paiement à venir");
  }, []);

  const handleDeletePayment = useCallback(() => {
    toast.error("Action non disponible en démo");
  }, []);

  const handleAddCard = useCallback(() => {
    toast.info("Ajout de carte à venir");
  }, []);

  const handleDownloadInvoice = useCallback((invoiceNumber: string) => {
    toast.success(`Téléchargement de ${invoiceNumber}`);
  }, []);

  // ✅ Loading state pour utilisateur
  if (isLoadingUser) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm text-slate-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Gestion du cas utilisateur non connecté
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Non authentifié
          </h3>
          <p className="text-slate-600 mb-4">
            Vous devez être connecté pour accéder aux paramètres.
          </p>
          <Button onClick={() => router.push("/auth/login")} variant="outline">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600 mt-1">
          Gérez vos préférences et informations de compte
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <>
          {user && (
            <ProfileSettingsSection
              initialData={{
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                email: user.email ?? "",
                phone: user.phone ?? "",
                company: user.company ?? "",
                address: user.address ?? "",
              }}
              onSave={handleProfileSave}
              isSaving={isSaving}
            />
          )}
        </>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <AccountSettingsSection
          currentEmail={user?.email}
          onChangeEmail={handleEmailChange}
          onChangePassword={handlePasswordChange}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <BillingSettingsSection
          onChangePlan={handleChangePlan}
          onCancelSubscription={handleCancelSubscription}
          onUpdatePayment={handleUpdatePayment}
          onDeletePayment={handleDeletePayment}
          onAddCard={handleAddCard}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  );
}
