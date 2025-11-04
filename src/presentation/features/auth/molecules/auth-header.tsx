"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  showLogo?: boolean;
}

export function AuthHeader({ title, subtitle, showLogo = true }: AuthHeaderProps) {
  return (
    <div className="text-center">
      {showLogo && (
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <span className="text-3xl font-bold text-slate-900">RENZO</span>
        </Link>
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-2">{title}</h1>
      <p className="text-slate-600">{subtitle}</p>
    </div>
  );
}
