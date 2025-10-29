"use client";

import { Button } from "@/components/ui/button";

type ViewMode = "all" | "completed" | "pending";

interface ImageFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
  };
}

export function ImageFilters({ viewMode, onViewModeChange, stats }: ImageFiltersProps) {
  const pendingCount = stats.pending + stats.processing;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={viewMode === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("all")}
      >
        Toutes ({stats.total})
      </Button>
      <Button
        variant={viewMode === "completed" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("completed")}
      >
        Terminées ({stats.completed})
      </Button>
      <Button
        variant={viewMode === "pending" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("pending")}
      >
        En cours ({pendingCount})
      </Button>
    </div>
  );
}
