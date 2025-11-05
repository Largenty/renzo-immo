"use client";

import { Card } from "@/shared";
import { Button } from "@/shared";
import { Sparkles } from "lucide-react";

interface CreditsOverviewCardProps {
  creditsRemaining: number;
  totalCredits: number;
  creditsUsed: number;
  planName: string;
  renewalDate: string;
  overagePrice: number;
  onChangePlan?: () => void;
}

export function CreditsOverviewCard({
  creditsRemaining,
  totalCredits,
  creditsUsed,
  planName,
  renewalDate,
  overagePrice,
  onChangePlan,
}: CreditsOverviewCardProps) {
  const usagePercentage = Math.round(((totalCredits - creditsRemaining) / totalCredits) * 100);

  return (
    <Card className="modern-card md:col-span-2 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-blue-600" size={24} />
            <h2 className="text-lg font-semibold text-slate-700">
              Crédits disponibles
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-slate-900">
              {creditsRemaining}
            </span>
            <span className="text-2xl text-slate-600">/ {totalCredits}</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {creditsUsed} crédits utilisés ce mois-ci
          </p>
        </div>
        <div className="text-right">
          <div className="px-3 py-1 bg-blue-600 text-white font-semibold text-sm rounded-sm mb-2">
            {planName}
          </div>
          <p className="text-xs text-slate-600">Renouvellement: {renewalDate}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-700 font-medium">Utilisation</span>
          <span className="text-slate-900 font-semibold">{usagePercentage}%</span>
        </div>
        <div className="h-3 bg-white rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      <div className="my-6 h-px bg-blue-200" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          <p className="font-medium mb-1">Crédit supplémentaire</p>
          <p>{overagePrice}€ / crédit après épuisement du forfait</p>
        </div>
        {onChangePlan && (
          <Button
            variant="outline"
            onClick={onChangePlan}
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Changer de forfait
          </Button>
        )}
      </div>
    </Card>
  );
}
