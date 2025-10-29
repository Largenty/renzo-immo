"use client";

import { Card } from "@/components/ui/card";
import { AuthHeader } from "../molecules/auth-header";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

export function AuthCard({
  title,
  subtitle,
  children,
  showLogo = true,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <AuthHeader title={title} subtitle={subtitle} showLogo={showLogo} />
        <Card className="modern-card p-8">{children}</Card>
      </div>
    </div>
  );
}
