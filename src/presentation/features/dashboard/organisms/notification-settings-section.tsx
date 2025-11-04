"use client";

import { useState } from "react";
import { Card } from "@/presentation/shared/ui/card";
import { Separator } from "@/presentation/shared/ui/separator";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface NotificationSettingsSectionProps {
  onSave?: (preferences: NotificationPreference[], pushEnabled: boolean) => void;
}

const defaultEmailPreferences: NotificationPreference[] = [
  {
    id: "projects",
    title: "Projets et rendus",
    description: "Recevez une notification quand vos images sont prêtes",
    enabled: true,
  },
  {
    id: "credits",
    title: "Crédits et facturation",
    description: "Alertes sur votre solde de crédits et factures",
    enabled: true,
  },
  {
    id: "features",
    title: "Nouveautés et fonctionnalités",
    description: "Soyez informé des nouvelles fonctionnalités RENZO",
    enabled: false,
  },
  {
    id: "tips",
    title: "Conseils et astuces",
    description: "Recevez des conseils pour optimiser vos rendus",
    enabled: false,
  },
];

export function NotificationSettingsSection({
  onSave,
}: NotificationSettingsSectionProps) {
  const [emailPreferences, setEmailPreferences] = useState<
    NotificationPreference[]
  >(defaultEmailPreferences);
  const [pushEnabled, setPushEnabled] = useState(false);

  const toggleEmailPreference = (id: string) => {
    setEmailPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  return (
    <Card className="modern-card p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Préférences de notification
      </h2>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Notifications par email
          </h3>
          <div className="space-y-4">
            {emailPreferences.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 rounded-md border border-slate-200 hover:border-blue-200 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleEmailPreference(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-sm peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Notifications push
          </h3>
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">
                  Activer les notifications push
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Recevez des notifications en temps réel dans votre navigateur
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={() => setPushEnabled(!pushEnabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-sm peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-sm after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
