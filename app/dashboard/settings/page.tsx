"use client";

import { useState } from "react";
import { User, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores";
import { SettingsTabs } from "@/components/dashboard/molecules/settings-tabs";
import {
  ProfileSettingsSection,
  type ProfileFormData,
} from "@/components/dashboard/organisms/profile-settings-section";
import { AccountSettingsSection } from "@/components/dashboard/organisms/account-settings-section";
import { BillingSettingsSection } from "@/components/dashboard/organisms/billing-settings-section";

export default function SettingsPage() {
  const { user, updateUser, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "account", label: "Compte", icon: Shield },
    { id: "billing", label: "Facturation", icon: CreditCard },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleProfileSave = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        address: data.address,
      });
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    setIsSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast.success("Email de confirmation envoyé", {
        description: "Vérifiez votre nouvelle adresse email pour confirmer le changement",
      });
    } catch (error: any) {
      toast.error("Erreur lors du changement d'email", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // Validation - mots de passe correspondent
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    // Validation - longueur minimale (12 caractères comme signup)
    if (data.newPassword.length < 12) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins 12 caractères",
      });
      return;
    }

    // Validation - au moins une minuscule
    if (!/[a-z]/.test(data.newPassword)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins une minuscule",
      });
      return;
    }

    // Validation - au moins une majuscule
    if (!/[A-Z]/.test(data.newPassword)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins une majuscule",
      });
      return;
    }

    // Validation - au moins un chiffre
    if (!/[0-9]/.test(data.newPassword)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins un chiffre",
      });
      return;
    }

    // Validation - au moins un caractère spécial
    if (!/[^a-zA-Z0-9]/.test(data.newPassword)) {
      toast.error("Erreur", {
        description: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Mot de passe modifié avec succès");
    } catch (error: any) {
      toast.error("Erreur lors du changement de mot de passe", {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error("Action non disponible en démo");
  };

  const handleChangePlan = () => {
    toast.info("Changement de forfait à venir");
  };

  const handleCancelSubscription = () => {
    toast.error("Action non disponible en démo");
  };

  const handleUpdatePayment = () => {
    toast.info("Modification de paiement à venir");
  };

  const handleDeletePayment = () => {
    toast.error("Action non disponible en démo");
  };

  const handleAddCard = () => {
    toast.info("Ajout de carte à venir");
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast.success(`Téléchargement de ${invoiceNumber}`);
  };

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
          {user ? (
            <ProfileSettingsSection
              initialData={{
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                company: user.company || "",
                address: user.address || "",
              }}
              onSave={handleProfileSave}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-slate-600">Chargement...</p>
              </div>
            </div>
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
