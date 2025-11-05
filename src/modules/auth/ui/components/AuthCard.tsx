"use client";

import { Card } from "@/shared";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-slate-600">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <Card className="modern-card p-8">{children}</Card>
      </div>
    </div>
  );
}
