import { Card } from "@/presentation/shared/ui/card";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "blue" | "green" | "yellow" | "red";
}

const variantStyles = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    text: "text-slate-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    text: "text-slate-700",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-gradient-to-br from-yellow-500 to-orange-600",
    text: "text-slate-700",
  },
  red: {
    card: "bg-red-50 border-red-200",
    iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
    text: "text-slate-700",
  },
};

export function InfoCard({
  icon: Icon,
  title,
  description,
  variant = "blue",
}: InfoCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={`${styles.card} p-6`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-md ${styles.iconBg} flex items-center justify-center`}
        >
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
          <p className={`text-sm ${styles.text}`}>{description}</p>
        </div>
      </div>
    </Card>
  );
}
