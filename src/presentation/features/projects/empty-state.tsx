"use client";

import { Card, Button } from "@/presentation/shared/ui";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="max-w-md mx-auto text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Icon className="text-white" size={28} />
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {Icon && <Icon size={20} className="mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
