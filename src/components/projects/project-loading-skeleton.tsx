"use client";

import { Card, Skeleton } from "@/components/ui";

export function ProjectLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-5 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Images grid skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="modern-card overflow-hidden">
            <div className="grid grid-cols-2 gap-0">
              <Skeleton className="h-48 rounded-none" />
              <Skeleton className="h-48 rounded-none" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
