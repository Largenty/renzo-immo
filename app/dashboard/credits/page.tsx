"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/modules/auth";
import {
  useCreditStats,
  useCreditTransactions,
  useCreditBalance,
  useWeeklyStats,
  useCreditPacks,
  type CreditTransaction,
} from "@/modules/credits";
import {
  CreditsOverviewCard,
  StatsCard,
  CreditPackCard,
  UsageHistoryTable,
  CreditsInfoCard,
  type UsageHistoryItem,
} from "@/modules/credits";

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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  // ✅ Rafraîchir les données si on revient d'un paiement réussi
  useEffect(() => {
    if (searchParams?.get('refresh') === 'true') {
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-stats'] });

      // Nettoyer l'URL sans recharger la page
      window.history.replaceState({}, '', '/dashboard/credits');

      toast.success('Vos crédits ont été mis à jour');
    }
  }, [searchParams, queryClient]);

  // ✅ Récupérer les données optimisées
  const { data: stats, isLoading: statsLoading } = useCreditStats(user?.id);
  const { data: balance, isLoading: balanceLoading } = useCreditBalance(user?.id);
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

  const handleBuyPack = async (packId: string, packName: string) => {
    setSelectedPack(packId);

    try {
      toast.info(`Redirection vers le paiement pour ${packName}...`);

      // Create Stripe Checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditPackId: packId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Erreur lors du paiement', {
        description: error instanceof Error ? error.message : 'Impossible de créer la session',
      });
      setSelectedPack(null);
    }
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
                iconColor={
                  weeklyStats && weeklyStats.percentageChange > 0
                    ? "bg-gradient-to-br from-orange-500 to-red-500"
                    : weeklyStats && weeklyStats.percentageChange < 0
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                }
                label="Crédits utilisés cette semaine"
                value={weeklyStats?.thisWeekCredits ?? 0}
                subtitle={
                  weeklyStats && weeklyStats.percentageChange !== 0
                    ? `${Math.abs(weeklyStats.percentageChange)}% ${
                        weeklyStats.percentageChange > 0 ? "de plus" : "de moins"
                      } que la semaine dernière`
                    : "Aucun changement"
                }
                subtitleColor={
                  weeklyStats && weeklyStats.percentageChange > 0
                    ? "text-orange-600"
                    : weeklyStats && weeklyStats.percentageChange < 0
                      ? "text-green-600"
                      : "text-slate-600"
                }
              />

              <StatsCard
                icon={ImageIcon}
                iconColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                label="Images générées"
                value={weeklyStats?.hdImagesCount ?? 0}
                subtitle={`${weeklyStats?.totalCreditsUsed ?? 0} crédits consommés cette semaine`}
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
                  <div className="col-span-full">
                    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        Aucun pack disponible
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                        Les packs de crédits sont en cours de configuration. Revenez bientôt pour acheter des crédits supplémentaires.
                      </p>
                    </div>
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
