"use client";

import { Card } from "@/shared";
import { Button } from "@/shared";
import {
  Clock,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export interface UsageHistoryItem {
  id: string;
  date: string;
  time: string;
  project: string;
  images: number;
  quality: string;
  credits: number;
  status: string;
}

interface UsageHistoryTableProps {
  history: UsageHistoryItem[];
  onExport?: () => void;
}

export function UsageHistoryTable({ history, onExport }: UsageHistoryTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Historique d&apos;utilisation
        </h2>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Calendar size={16} className="mr-2" />
            Exporter
          </Button>
        )}
      </div>

      <Card className="modern-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">
          <div className="col-span-3">Date</div>
          <div className="col-span-4">Projet</div>
          <div className="col-span-2 text-center">Images</div>
          <div className="col-span-2 text-center">Crédits</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-200">
          {history.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-3 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(item.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>

              <div className="col-span-4 flex items-center">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {item.project}
                  </p>
                  <p className="text-xs text-slate-500">Qualité {item.quality}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-slate-100">
                  <ImageIcon size={14} className="text-slate-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {item.images}
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <div className="flex items-center gap-1 px-3 py-1 rounded-sm bg-blue-50 border border-blue-100">
                  <Sparkles size={14} className="text-blue-600" />
                  <span className="text-sm font-bold text-blue-600">
                    -{item.credits}
                  </span>
                </div>
              </div>

              <div className="col-span-1 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Affichage de {history.length} dernières transactions
            </span>
            <Link href="/dashboard/credits/history">
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
