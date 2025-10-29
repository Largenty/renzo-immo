"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Bell, CreditCard, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { SettingsTabs } from "@/components/dashboard/molecules/settings-tabs";
import {
  ProfileSettingsSection,
  type ProfileFormData,
} from "@/components/dashboard/organisms/profile-settings-section";
import { AccountSettingsSection } from "@/components/dashboard/organisms/account-settings-section";
import { NotificationSettingsSection } from "@/components/dashboard/organisms/notification-settings-section";
import { BillingSettingsSection } from "@/components/dashboard/organisms/billing-settings-section";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "account", label: "Compte", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Facturation", icon: CreditCard },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleProfileSave = (data: ProfileFormData) => {
    console.log("Profile data:", data);
    handleSave();
  };

  const handlePasswordChange = (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    console.log("Password change:", data);
    toast.success("Mot de passe modifié avec succès");
  };

  const handleEnable2FA = () => {
    toast.info("Fonctionnalité 2FA à venir");
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
        <div className="space-y-6">
          <ProfileSettingsSection
            initialData={{
              firstName: "Jean",
              lastName: "Dupont",
              email: "jean.dupont@example.com",
              phone: "+33 6 12 34 56 78",
              company: "Dupont Immobilier",
              address: "45 Avenue des Champs-Élysées, 75008 Paris",
            }}
            onSave={handleProfileSave}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <AccountSettingsSection
          onChangePassword={handlePasswordChange}
          onEnable2FA={handleEnable2FA}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <NotificationSettingsSection onSave={() => handleSave()} />

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Enregistrer les préférences
                </>
              )}
            </Button>
          </div>
        </div>
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
