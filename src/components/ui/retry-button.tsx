"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { retryWithBackoff } from "@/lib/errors";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface RetryButtonProps {
  onRetry: () => Promise<void>;
  children?: React.ReactNode;
  maxRetries?: number;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Button with automatic retry logic and exponential backoff
 *
 * @example
 * ```tsx
 * <RetryButton
 *   onRetry={async () => {
 *     await refetch();
 *   }}
 *   maxRetries={3}
 * >
 *   Réessayer
 * </RetryButton>
 * ```
 */
export function RetryButton({
  onRetry,
  children = "Réessayer",
  maxRetries = 3,
  className,
  variant = "default",
  size = "default",
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(0);

    try {
      await retryWithBackoff(onRetry, maxRetries);
      toast.success("Opération réussie", {
        description: "L'action a été effectuée avec succès",
      });
    } catch (error) {
      logger.error("Retry failed after all attempts:", error);
      toast.error("Échec après plusieurs tentatives", {
        description: "Veuillez réessayer plus tard ou contacter le support",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button
      onClick={handleRetry}
      disabled={isRetrying}
      className={className}
      variant={variant}
      size={size}
    >
      {isRetrying ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Réessai en cours...
        </>
      ) : (
        <>
          <RefreshCw size={16} className="mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}
