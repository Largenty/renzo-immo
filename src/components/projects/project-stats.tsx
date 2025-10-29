"use client";

import { Card } from "@/components/ui/card";

interface ProjectStatsProps {
  total: number;
  completed: number;
  processing: number;
  pending: number;
}

export function ProjectStats({ total, completed, processing, pending }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="modern-card p-4">
        <p className="text-sm text-slate-600 font-medium mb-1">Total</p>
        <p className="text-2xl font-bold text-slate-900">{total}</p>
      </Card>
      <Card className="modern-card p-4">
        <p className="text-sm text-slate-600 font-medium mb-1">Terminées</p>
        <p className="text-2xl font-bold text-green-600">{completed}</p>
      </Card>
      <Card className="modern-card p-4">
        <p className="text-sm text-slate-600 font-medium mb-1">En cours</p>
        <p className="text-2xl font-bold text-blue-600">{processing}</p>
      </Card>
      <Card className="modern-card p-4">
        <p className="text-sm text-slate-600 font-medium mb-1">En attente</p>
        <p className="text-2xl font-bold text-slate-600">{pending}</p>
      </Card>
    </div>
  );
}
