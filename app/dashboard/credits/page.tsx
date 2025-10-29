"use client";

import { useState } from "react";
import { TrendingUp, ImageIcon } from "lucide-react";
import { PRICING } from "@/config/pricing";
import { toast } from "sonner";
import {
  CreditsOverviewCard,
  StatsCard,
  CreditPackCard,
  UsageHistoryTable,
  CreditsInfoCard,
  type CreditPack,
  type UsageHistoryItem,
} from "@/components/credits";

// Mock data
const currentPlan = PRICING.plans[1]; // Pro Plan
const creditsUsed = 72;
const creditsRemaining = currentPlan.credits - creditsUsed;

const usageHistory: UsageHistoryItem[] = [
  {
    id: "1",
    date: "2024-10-22",
    time: "14:32",
    project: "Villa Moderne - Cannes",
    images: 3,
    quality: "HD",
    credits: 6,
    status: "completed",
  },
  {
    id: "2",
    date: "2024-10-22",
    time: "11:15",
    project: "Appartement Haussmannien",
    images: 2,
    quality: "Standard",
    credits: 2,
    status: "completed",
  },
  {
    id: "3",
    date: "2024-10-21",
    time: "16:45",
    project: "Loft Industriel",
    images: 5,
    quality: "HD",
    credits: 10,
    status: "completed",
  },
  {
    id: "4",
    date: "2024-10-21",
    time: "09:22",
    project: "Maison de Ville - Lyon",
    images: 4,
    quality: "Standard",
    credits: 4,
    status: "completed",
  },
  {
    id: "5",
    date: "2024-10-20",
    time: "15:10",
    project: "Studio Paris 11ème",
    images: 6,
    quality: "HD",
    credits: 12,
    status: "completed",
  },
];

const creditPacks: CreditPack[] = [
  {
    id: "pack-20",
    name: "Pack Starter",
    credits: 20,
    price: 24,
    pricePerCredit: 1.2,
    popular: false,
  },
  {
    id: "pack-50",
    name: "Pack Standard",
    credits: 50,
    price: 55,
    pricePerCredit: 1.1,
    popular: true,
  },
  {
    id: "pack-100",
    name: "Pack Pro",
    credits: 100,
    price: 99,
    pricePerCredit: 0.99,
    popular: false,
  },
  {
    id: "pack-200",
    name: "Pack Agence",
    credits: 200,
    price: 180,
    pricePerCredit: 0.9,
    popular: false,
  },
];

export default function CreditsPage() {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const handleBuyPack = (packId: string, packName: string) => {
    setSelectedPack(packId);
    // Simulate purchase
    setTimeout(() => {
      toast.success(`Pack ${packName} acheté avec succès !`);
      setSelectedPack(null);
    }, 1000);
  };

  const handleChangePlan = () => {
    toast.info("Redirection vers la page de changement de forfait...");
  };

  const handleExportHistory = () => {
    toast.info("Export de l'historique en cours...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Crédits</h1>
        <p className="text-slate-600 mt-1">
          Gérez vos crédits et consultez votre historique d&apos;utilisation
        </p>
      </div>

      {/* Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CreditsOverviewCard
          creditsRemaining={creditsRemaining}
          totalCredits={currentPlan.credits}
          creditsUsed={creditsUsed}
          planName={currentPlan.name}
          renewalDate="12 nov."
          overagePrice={currentPlan.overage}
          onChangePlan={handleChangePlan}
        />

        {/* Stats */}
        <div className="space-y-6">
          <StatsCard
            icon={TrendingUp}
            iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
            label="Cette semaine"
            value={24}
            subtitle="+12% vs semaine dernière"
            subtitleColor="text-green-600"
          />

          <StatsCard
            icon={ImageIcon}
            iconColor="bg-gradient-to-br from-orange-500 to-red-600"
            label="Images HD"
            value={36}
            subtitle="72 crédits utilisés"
          />
        </div>
      </div>

      {/* Buy Credit Packs */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Acheter des crédits supplémentaires
          </h2>
          <p className="text-slate-600">
            Les crédits achetés n&apos;expirent jamais et s&apos;ajoutent à votre forfait
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPacks.map((pack) => (
            <CreditPackCard
              key={pack.id}
              pack={pack}
              isProcessing={selectedPack === pack.id}
              onBuy={handleBuyPack}
            />
          ))}
        </div>
      </div>

      {/* Usage History */}
      <UsageHistoryTable history={usageHistory} onExport={handleExportHistory} />

      {/* Information Card */}
      <CreditsInfoCard />
    </div>
  );
}
