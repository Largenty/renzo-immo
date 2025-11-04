"use client";

import { useState } from "react";
import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import { Input } from "@/presentation/shared/ui/input";
import { Label } from "@/presentation/shared/ui/label";
import { Separator } from "@/presentation/shared/ui/separator";
import { Trash2, Mail } from "lucide-react";

interface AccountSettingsSectionProps {
  currentEmail?: string;
  onChangeEmail?: (newEmail: string) => void;
  onChangePassword?: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  onDeleteAccount?: () => void;
}

export function AccountSettingsSection({
  currentEmail,
  onChangeEmail,
  onChangePassword,
  onDeleteAccount,
}: AccountSettingsSectionProps) {
  const [newEmail, setNewEmail] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEmailChange = () => {
    if (onChangeEmail && newEmail) {
      onChangeEmail(newEmail);
      setNewEmail("");
    }
  };

  const handlePasswordChange = () => {
    if (onChangePassword) {
      onChangePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Section */}
      <Card className="modern-card p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Sécurité du compte
        </h2>

        <div className="space-y-6">
          {/* Change Email */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Changer d'email
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Email actuel: <span className="font-medium text-slate-900">{currentEmail}</span>
            </p>
            <div className="space-y-2 mb-4">
              <Label htmlFor="newEmail">Nouvel email</Label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="nouveau@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={handleEmailChange} disabled={!newEmail}>
              Changer l'email
            </Button>
            <p className="text-xs text-slate-500 mt-2">
              Un email de confirmation sera envoyé à votre nouvelle adresse
            </p>
          </div>

          <Separator />

          {/* Change Password */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Changer de mot de passe
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  minLength={12}
                />
                <p className="text-xs text-slate-500">
                  12 caractères min. avec majuscule, minuscule, chiffre et caractère spécial
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le nouveau mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <Button variant="outline" onClick={handlePasswordChange}>
                Changer le mot de passe
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="modern-card p-6 border-red-200 bg-red-50/50">
        <h2 className="text-xl font-bold text-red-900 mb-2">Zone de danger</h2>
        <p className="text-sm text-red-700 mb-6">
          Ces actions sont irréversibles. Procédez avec précaution.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-md border border-red-200">
            <div>
              <h3 className="font-semibold text-slate-900">
                Supprimer le compte
              </h3>
              <p className="text-sm text-slate-600">
                Supprimez définitivement votre compte et toutes vos données
              </p>
            </div>
            <Button variant="destructive" onClick={onDeleteAccount}>
              <Trash2 size={18} className="mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
