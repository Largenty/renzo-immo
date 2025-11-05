"use client";

import { Card } from "@/shared";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: number | string;
  subtitle?: string;
  subtitleColor?: string;
}

export function StatsCard({
  icon: Icon,
  iconColor,
  label,
  value,
  subtitle,
  subtitleColor = "text-slate-500",
}: StatsCardProps) {
  return (
    <Card className="modern-card p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 rounded-md ${iconColor} flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
      </div>
      <p className="text-sm text-slate-600 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && (
        <p className={`text-xs ${subtitleColor} font-medium mt-1`}>{subtitle}</p>
      )}
    </Card>
  );
}
