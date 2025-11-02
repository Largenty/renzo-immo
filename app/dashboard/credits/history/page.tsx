"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import { useCurrentUser } from "@/domain/auth";
import {
  useCreditStats,
  useCreditTransactionsPaginated,
  useExportTransactions,
  type TransactionTypeFilter,
} from "@/domain/credits";
import type { CreditTransaction } from "@/domain/credits/models/credit-transaction";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Plus,
  Gift,
} from "lucide-react";

// Types pour l'affichage
interface DisplayTransaction extends CreditTransaction {
  displayAmount: number; // Montant absolu pour l'affichage
  isDebit: boolean; // true si crédits retirés, false si crédits ajoutés
}

// Mapper les transactions vers le format d'affichage
function mapToDisplayTransaction(txn: CreditTransaction): DisplayTransaction {
  const isDebit = txn.type === "usage";
  const displayAmount = Math.abs(txn.amount);

  return {
    ...txn,
    displayAmount,
    isDebit,
  };
}

// Fonction d'export CSV
function exportToCSV(transactions: DisplayTransaction[]): void {
  if (transactions.length === 0) {
    toast.error("Aucune transaction à exporter");
    return;
  }

  // En-têtes CSV
  const headers = [
    "Date",
    "Heure",
    "Type",
    "Description",
    "Montant",
    "Opération",
  ];

  // Lignes CSV
  const rows = transactions.map((txn) => {
    const date = new Date(txn.createdAt);
    const dateStr = date.toLocaleDateString("fr-FR");
    const timeStr = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const typeLabels: Record<CreditTransaction["type"], string> = {
      purchase: "Achat",
      usage: "Utilisation",
      refund: "Remboursement",
      bonus: "Bonus",
    };

    const operation = txn.isDebit ? "Débit" : "Crédit";
    const amountPrefix = txn.isDebit ? "-" : "+";

    return [
      dateStr,
      timeStr,
      typeLabels[txn.type],
      `"${txn.description.replace(/"/g, '""')}"`, // Échapper les guillemets
      `${amountPrefix}${txn.displayAmount}`,
      operation,
    ].join(",");
  });

  // Générer le CSV
  const csvContent = [headers.join(","), ...rows].join("\n");

  // Créer le blob et télécharger
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  }); // BOM UTF-8 pour Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historique-credits-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Export CSV téléchargé");
}

// Helper pour obtenir l'icône de type
function getTypeIcon(type: CreditTransaction["type"]) {
  switch (type) {
    case "purchase":
      return <Plus size={16} className="text-blue-600" />;
    case "usage":
      return <TrendingDown size={16} className="text-red-600" />;
    case "refund":
      return <TrendingUp size={16} className="text-green-600" />;
    case "bonus":
      return <Gift size={16} className="text-purple-600" />;
  }
}

// Helper pour obtenir le libellé de type
function getTypeLabel(type: CreditTransaction["type"]): string {
  switch (type) {
    case "purchase":
      return "Achat";
    case "usage":
      return "Utilisation";
    case "refund":
      return "Remboursement";
    case "bonus":
      return "Bonus";
  }
}

// Helper pour obtenir la couleur du type
function getTypeColor(type: CreditTransaction["type"]): string {
  switch (type) {
    case "purchase":
      return "bg-blue-50 border-blue-100 text-blue-700";
    case "usage":
      return "bg-red-50 border-red-100 text-red-700";
    case "refund":
      return "bg-green-50 border-green-100 text-green-700";
    case "bonus":
      return "bg-purple-50 border-purple-100 text-purple-700";
  }
}

export default function CreditsHistoryPage() {
  const { data: user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TransactionTypeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ✅ Utiliser la pagination côté serveur (optimisé)
  const {
    data: paginatedData,
    isLoading,
    error,
  } = useCreditTransactionsPaginated(
    user?.id,
    currentPage,
    itemsPerPage,
    searchQuery,
    filterType
  );

  // ✅ Récupérer les statistiques globales (fonction SQL optimisée)
  const { data: stats } = useCreditStats(user?.id);

  // ✅ Hook pour l'export CSV (charge toutes les transactions seulement lors de l'export)
  const { mutate: exportTransactions, isPending: isExporting } =
    useExportTransactions(user?.id);

  // Extraire les données paginées
  const totalPages = paginatedData?.totalPages || 1;
  const totalCount = paginatedData?.totalCount || 0;

  // Mapper les transactions paginées vers le format d'affichage
  const displayTransactions = useMemo(
    () => (paginatedData?.transactions || []).map(mapToDisplayTransaction),
    [paginatedData?.transactions]
  );

  // Réinitialiser la page lors d'un changement de filtre
  const handleFilterChange = (newFilter: TransactionTypeFilter) => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // ✅ Export CSV optimisé (non bloquant)
  const handleExport = () => {
    exportTransactions(undefined, {
      onSuccess: (transactions) => {
        const displayTxns = transactions.map(mapToDisplayTransaction);
        exportToCSV(displayTxns);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="modern-card p-6">
          <div className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Erreur lors du chargement
            </h3>
            <p className="text-slate-600">
              {error instanceof Error
                ? error.message
                : "Une erreur est survenue"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/credits">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Historique complet
            </h1>
            <p className="mt-1 text-slate-600">
              Toutes vos transactions de crédits
            </p>
          </div>
        </div>

        <Button
          onClick={handleExport}
          variant="outline"
          disabled={isExporting || totalCount === 0}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download size={16} className="mr-2" />
          )}
          Exporter (CSV)
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="modern-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600">
              <Plus className="text-white" size={18} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-600">
            Crédits achetés
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.totalPurchased || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Achats et bonus</p>
        </Card>

        <Card className="modern-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-orange-600">
              <TrendingDown className="text-white" size={18} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-600">
            Crédits utilisés
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.totalUsed || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Utilisations</p>
        </Card>

        <Card className="modern-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-emerald-600">
              <Sparkles className="text-white" size={18} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-600">
            Solde restant
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.totalRemaining || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Crédits disponibles</p>
        </Card>

        <Card className="modern-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-600">
              <Filter className="text-white" size={18} />
            </div>
          </div>
          <p className="mb-1 text-sm font-medium text-slate-600">Total</p>
          <p className="text-3xl font-bold text-slate-900">
            {stats?.transactionsCount || 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {(stats?.transactionsCount || 0) > 1 ? "Transactions" : "Transaction"}
          </p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="modern-card p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Rechercher dans les descriptions..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="purchase">Achats</SelectItem>
                <SelectItem value="usage">Utilisations</SelectItem>
                <SelectItem value="refund">Remboursements</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Info */}
        {(searchQuery || filterType !== "all") && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Résultats filtrés:</span>
            <span>
              {totalCount} transaction{totalCount > 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                handleFilterChange("all");
              }}
              className="ml-auto"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Card>

      {/* Transactions Table */}
      <Card className="modern-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-center">Montant</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-200">
          {displayTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-slate-100">
                <Search size={24} className="text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {totalCount === 0 && !searchQuery && filterType === "all"
                  ? "Aucune transaction"
                  : "Aucun résultat"}
              </h3>
              <p className="text-slate-600">
                {totalCount === 0 && !searchQuery && filterType === "all"
                  ? "Vous n'avez pas encore de transactions de crédits"
                  : "Essayez de modifier vos critères de recherche"}
              </p>
            </div>
          ) : (
            displayTransactions.map((transaction: DisplayTransaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-12 gap-4 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <Calendar
                    size={16}
                    className="flex-shrink-0 text-slate-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.createdAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {transaction.createdAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 flex items-center gap-2">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {getTypeLabel(transaction.type)}
                    </p>
                    <span
                      className={`rounded-sm border px-2 py-0.5 text-xs ${getTypeColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.isDebit ? "Débit" : "Crédit"}
                    </span>
                  </div>
                </div>

                <div className="col-span-5 flex items-center">
                  <p className="line-clamp-2 text-sm text-slate-700">
                    {transaction.description}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <div
                    className={`flex items-center gap-1 rounded-sm border px-3 py-1 ${
                      transaction.isDebit
                        ? "border-red-100 bg-red-50 text-red-700"
                        : "border-green-100 bg-green-50 text-green-700"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span className="text-sm font-bold">
                      {transaction.isDebit ? "-" : "+"}
                      {transaction.displayAmount}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages} • Affichage de{" "}
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalCount)} sur{" "}
                {totalCount} transactions
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
