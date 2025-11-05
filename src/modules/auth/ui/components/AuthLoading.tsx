/**
 * AuthLoading Component
 * Reusable loading state for authentication pages
 * Used in Suspense fallbacks for login, signup, and verify-email pages
 */

import { Loader2 } from "lucide-react";
import { AuthCard } from "./AuthCard";

interface AuthLoadingProps {
  title: string;
  subtitle: string;
}

export function AuthLoading({ title, subtitle }: AuthLoadingProps) {
  return (
    <AuthCard title={title} subtitle={subtitle}>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </AuthCard>
  );
}
