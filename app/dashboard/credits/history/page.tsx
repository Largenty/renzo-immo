"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { logger } from '@/lib/logger';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Types
type TransactionStatus = "completed" | "failed" | "processing";
type QualityType = "Standard" | "HD";

interface Transaction {
  id: string;
  date: string;
  time: string;
  project: string;
  images: number;
  quality: QualityType;
  credits: number;
  status: TransactionStatus;
}

// Extended mock data
const generateMockData = (): Transaction[] => {
  const projects = [
    "Villa Moderne - Cannes",
    "Appartement Haussmannien",
    "Loft Industriel",
    "Maison de Ville - Lyon",
    "Studio Paris 11ème",
    "Penthouse La Défense",
    "Mas Provençal - Aix",
    "Duplex Bordeaux Centre",
    "Chalet Alpes",
    "Villa Nice Cimiez",
  ];

  const data: Transaction[] = [];
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(i / 3);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    const quality: QualityType = Math.random() > 0.5 ? "HD" : "Standard";
    const images = Math.floor(Math.random() * 6) + 1;
    const credits = quality === "HD" ? images * 2 : images;

    data.push({
      id: `txn-${1000 + i}`,
      date: date.toISOString().split("T")[0],
      time: `${Math.floor(Math.random() * 24)
        .toString()
        .padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}`,
      project: projects[Math.floor(Math.random() * projects.length)],
      images,
      quality,
      credits,
      status: Math.random() > 0.95 ? "failed" : "completed",
    });
  }

  return data.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
};

const allTransactions = generateMockData();

export default function CreditsHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuality, setFilterQuality] = useState<"all" | QualityType>(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | TransactionStatus
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter transactions
  const filteredTransactions = allTransactions.filter((txn) => {
    const matchesSearch = txn.project
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesQuality =
      filterQuality === "all" || txn.quality === filterQuality;
    const matchesStatus =
      filterStatus === "all" || txn.status === filterStatus;

    return matchesSearch && matchesQuality && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Calculate statistics
  const totalCredits = filteredTransactions.reduce(
    (sum, txn) => sum + txn.credits,
    0
  );
  const totalImages = filteredTransactions.reduce(
    (sum, txn) => sum + txn.images,
    0
  );
  const completedCount = filteredTransactions.filter(
    (txn) => txn.status === "completed"
  ).length;

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={18} className="text-green-600" />;
      case "failed":
        return <XCircle size={18} className="text-red-600" />;
      case "processing":
        return <Clock size={18} className="text-orange-600" />;
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "failed":
        return "Échec";
      case "processing":
        return "En cours";
    }
  };

  const handleExport = () => {
    // Export logic here
    logger.debug("Exporting data...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            <p className="text-slate-600 mt-1">
              Toutes vos transactions de crédits
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline">
          <Download size={16} className="mr-2" />
          Exporter (CSV)
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="modern-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium mb-1">
            Total crédits
          </p>
          <p className="text-3xl font-bold text-slate-900">{totalCredits}</p>
          <p className="text-xs text-slate-500 mt-1">
            Sur {filteredTransactions.length} transactions
          </p>
        </Card>

        <Card className="modern-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <ImageIcon className="text-white" size={18} />
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium mb-1">
            Total images
          </p>
          <p className="text-3xl font-bold text-slate-900">{totalImages}</p>
          <p className="text-xs text-slate-500 mt-1">Images générées</p>
        </Card>

        <Card className="modern-card p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <CheckCircle2 className="text-white" size={18} />
            </div>
          </div>
          <p className="text-sm text-slate-600 font-medium mb-1">
            Taux de succès
          </p>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round((completedCount / filteredTransactions.length) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {completedCount} / {filteredTransactions.length} réussies
          </p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="modern-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Rechercher un projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quality Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterQuality}
              onChange={(e) =>
                setFilterQuality(e.target.value as "all" | QualityType)
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes qualités</option>
              <option value="Standard">Standard</option>
              <option value="HD">HD</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | TransactionStatus)
              }
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous statuts</option>
              <option value="completed">Terminé</option>
              <option value="failed">Échec</option>
              <option value="processing">En cours</option>
            </select>
          </div>
        </div>

        {/* Active Filters Info */}
        {(searchQuery || filterQuality !== "all" || filterStatus !== "all") && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Résultats filtrés:</span>
            <span>
              {filteredTransactions.length} transaction
              {filteredTransactions.length > 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterQuality("all");
                setFilterStatus("all");
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
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Projet</div>
          <div className="col-span-2 text-center">Images</div>
          <div className="col-span-2 text-center">Crédits</div>
          <div className="col-span-2 text-center">Statut</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-200">
          {paginatedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Aucun résultat
              </h3>
              <p className="text-slate-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(transaction.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">{transaction.time}</p>
                  </div>
                </div>

                <div className="col-span-4 flex items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.project}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qualité {transaction.quality}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-slate-100">
                    <ImageIcon size={14} className="text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">
                      {transaction.images}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-blue-50 border border-blue-100">
                    <Sparkles size={14} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-600">
                      -{transaction.credits}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-center gap-2">
                  {getStatusIcon(transaction.status)}
                  <span className="text-sm font-medium text-slate-700">
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages} • Affichage de{" "}
                {startIndex + 1}-
                {Math.min(endIndex, filteredTransactions.length)} sur{" "}
                {filteredTransactions.length} transactions
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
