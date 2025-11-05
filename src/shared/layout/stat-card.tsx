import { Card } from "@/shared";
import { LucideIcon, TrendingUp } from "lucide-react";

interface StatCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  loading?: boolean;
}

export function StatCard({
  name,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="modern-card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-md bg-slate-200" />
          <div className="w-4 h-4 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-9 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="modern-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Icon className="text-white" size={20} />
        </div>
        {changeType === "positive" && (
          <TrendingUp size={16} className="text-green-600" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-600 font-medium">{name}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {change && (
          <p
            className={`text-xs font-medium ${
              changeType === "positive"
                ? "text-green-600"
                : changeType === "negative"
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </Card>
  );
}
