"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

/**
 * Composant ConditionalLayout - Affiche la navbar et le footer uniquement sur les pages publiques
 *
 * Ne les affiche pas sur :
 * - Les pages du dashboard (/dashboard/*)
 * - Les pages d'authentification (/auth/*)
 */

function ConditionalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ne pas afficher la navbar/footer sur les pages dashboard et auth
  const isPublicPage = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/auth');

  return (
    <>
      {isPublicPage && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {isPublicPage && <Footer />}
    </>
  );
}

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen">{children}</main>}>
      <ConditionalLayoutContent>{children}</ConditionalLayoutContent>
    </Suspense>
  );
}
