"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/domain/auth";
import {
  useCreditStats,
  useCreditTransactions,
  useCreditBalance,
  useWeeklyStats,
  useCreditPacks,
  type CreditTransaction,
} from "@/domain/credits";
import {
  CreditsOverviewCard,
  StatsCard,
  CreditPackCard,
  UsageHistoryTable,
  CreditsInfoCard,
  type UsageHistoryItem,
} from "@/components/credits";

// ✅ Mapper les transactions vers UsageHistoryItem avec colonnes structurées
function mapTransactionsToUsageHistory(
  transactions: CreditTransaction[]
): UsageHistoryItem[] {
  return transactions
    .filter((txn) => txn.type === "usage") // Seulement les utilisations
    .slice(0, 5) // Limiter à 5 pour l'aperçu
    .map((txn) => {
      const date = new Date(txn.createdAt);

      // ✅ Utiliser les colonnes structurées au lieu de parser avec regex
      const quality = txn.imageQuality || "standard";
      const images = txn.imageCount || 1;
      const project = txn.relatedProjectName || "Projet";

      return {
        id: txn.id,
        date: date.toISOString().split("T")[0],
        time: date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        project,
        images,
        quality,
        credits: Math.abs(txn.amount),
        status: "completed",
      };
    });
}

export default function CreditsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  // ✅ Récupérer les données optimisées
  const { data: stats, isLoading: statsLoading } = useCreditStats(user?.id);
  const { data: balance, isLoading: balanceLoading } = useCreditBalance(
    user?.id
  );
  const { data: weeklyStats, isLoading: weeklyStatsLoading } = useWeeklyStats(
    user?.id
  );
  const { data: transactions = [], isLoading: transactionsLoading } =
    useCreditTransactions(user?.id, 5); // ✅ Seulement 5 pour l'aperçu
  const {
    data: creditPacks = [],
    isLoading: packsLoading,
    error: packsError,
  } = useCreditPacks();

  // Calculer les valeurs affichées
  const creditsRemaining = stats?.totalRemaining ?? balance ?? 0;
  const creditsUsed = stats?.totalUsed ?? 0;
  const totalCredits = stats?.totalPurchased ?? creditsRemaining;

  // Mapper les transactions vers l'historique
  const usageHistory = useMemo(
    () => mapTransactionsToUsageHistory(transactions),
    [transactions]
  );

  const handleBuyPack = (packId: string, packName: string) => {
    setSelectedPack(packId);

    // TODO: Implémenter le vrai flow d'achat (Stripe, etc.)
    // Pour l'instant, rediriger vers la page de checkout
    toast.info(`Redirection vers le paiement pour ${packName}...`);
    // router.push(`/checkout?pack=${packId}`);

    // Simuler l'achat temporairement
    setTimeout(() => {
      toast.success(`Pack ${packName} acheté avec succès !`);
      setSelectedPack(null);
    }, 1000);
  };

  const handleChangePlan = () => {
    router.push("/dashboard/settings/billing");
  };

  const handleExportHistory = () => {
    router.push("/dashboard/credits/history");
  };

  const isLoading = statsLoading || balanceLoading || weeklyStatsLoading || transactionsLoading;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Crédits</h1>
        <p className="mt-1 text-slate-600">
          Gérez vos crédits et consultez votre historique d&apos;utilisation
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Credits Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <CreditsOverviewCard
              creditsRemaining={creditsRemaining}
              totalCredits={totalCredits || creditsRemaining}
              creditsUsed={Math.max(0, creditsUsed)}
              planName="Crédits"
              renewalDate="N/A"
              overagePrice={0}
              onChangePlan={handleChangePlan}
            />

            {/* Stats */}
            <div className="space-y-6">
              <StatsCard
                icon={TrendingUp}
                iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
                label="Cette semaine"
                value={weeklyStats?.thisWeekCredits ?? 0}
                subtitle={
                  weeklyStats && weeklyStats.percentageChange !== 0
                    ? `${weeklyStats.percentageChange > 0 ? "+" : ""}${weeklyStats.percentageChange}% vs semaine dernière`
                    : "Aucun changement"
                }
                subtitleColor={
                  weeklyStats && weeklyStats.percentageChange > 0
                    ? "text-green-600"
                    : weeklyStats && weeklyStats.percentageChange < 0
                      ? "text-red-600"
                      : "text-slate-600"
                }
              />

              <StatsCard
                icon={ImageIcon}
                iconColor="bg-gradient-to-br from-orange-500 to-red-600"
                label="Images HD"
                value={weeklyStats?.hdImagesCount ?? 0}
                subtitle={`${weeklyStats?.totalCreditsUsed ?? 0} crédits utilisés cette semaine`}
              />
            </div>
          </div>

          {/* Buy Credit Packs */}
          <div>
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                Acheter des crédits supplémentaires
              </h2>
              <p className="text-slate-600">
                Les crédits achetés n&apos;expirent jamais et s&apos;ajoutent à
                votre forfait
              </p>
            </div>

            {packsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : packsError ? (
              <div className="py-12 text-center">
                <p className="text-red-600">
                  Erreur lors du chargement des packs de crédits
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {creditPacks.map((pack) => (
                  <CreditPackCard
                    key={pack.id}
                    pack={pack}
                    isProcessing={selectedPack === pack.id}
                    onBuy={handleBuyPack}
                  />
                ))}
                {creditPacks.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-600">
                    Aucun pack de crédits disponible
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usage History */}
          <UsageHistoryTable
            history={usageHistory}
            onExport={handleExportHistory}
          />

          {/* Information Card */}
          <CreditsInfoCard />
        </>
      )}
    </div>
  );
}
