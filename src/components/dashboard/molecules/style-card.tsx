"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionMenu, type ActionMenuItem, AVAILABLE_ICONS } from "../atoms";
import { Sparkles } from "lucide-react";

interface StyleCardProps {
  name: string;
  description?: string;
  iconName?: string;
  allowFurniture?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const StyleCard = memo(function StyleCard({
  name,
  description,
  iconName = "Sparkles",
  allowFurniture,
  onEdit,
  onDelete,
}: StyleCardProps) {
  const IconComponent = AVAILABLE_ICONS.find((i) => i.name === iconName)?.icon || Sparkles;

  const menuItems: ActionMenuItem[] = [
    {
      label: "Modifier",
      icon: require("lucide-react").Edit3,
      onClick: onEdit,
    },
    {
      label: "Supprimer",
      icon: require("lucide-react").Trash2,
      onClick: onDelete,
      variant: "destructive" as const,
    },
  ];

  return (
    <Card className="modern-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <IconComponent className="text-white" size={24} />
        </div>
        <ActionMenu items={menuItems} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{name}</h3>
      {description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{description}</p>
      )}

      {allowFurniture && (
        <Badge variant="secondary" className="text-xs">
          Avec meubles
        </Badge>
      )}
    </Card>
  );
});
