"use client";

import { Card, Button } from "@/components/ui";
import { Upload } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="modern-card p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Upload className="text-white" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Upload size={20} className="mr-2" />
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
