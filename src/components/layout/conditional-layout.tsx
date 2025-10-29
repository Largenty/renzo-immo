"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

/**
 * Composant ConditionalLayout - Affiche la navbar et le footer uniquement sur les pages publiques
 *
 * Ne les affiche pas sur :
 * - Les pages du dashboard (/dashboard/*)
 * - Les pages d'authentification (/auth/*)
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Éviter l'erreur d'hydratation en attendant que le composant soit monté côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ne pas afficher la navbar/footer sur les pages dashboard et auth
  const isPublicPage = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/auth');

  return (
    <>
      {isClient && isPublicPage && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {isClient && isPublicPage && <Footer />}
    </>
  );
}
