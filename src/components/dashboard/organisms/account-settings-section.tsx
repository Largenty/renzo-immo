"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

interface AccountSettingsSectionProps {
  onChangePassword?: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  onEnable2FA?: () => void;
  onDeleteAccount?: () => void;
}

export function AccountSettingsSection({
  onChangePassword,
  onEnable2FA,
  onDeleteAccount,
}: AccountSettingsSectionProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
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

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Authentification à deux facteurs
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Ajoutez une couche de sécurité supplémentaire à votre compte
          </p>
          <Button variant="outline" onClick={onEnable2FA}>
            Activer 2FA
          </Button>
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
