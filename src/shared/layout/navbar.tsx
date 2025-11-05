"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared";
import { gsap } from "@/lib/gsap-utils";
import { Menu, X, User, LogOut } from "lucide-react";
import { useCurrentUser } from "@/modules/auth";
// TODO: MIGRATION - import { LogoutModal } from "@/shared/shared/modals/logout-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared";

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // TODO: MIGRATION -   const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Use React Query as single source of truth
  const { data: user, isLoading } = useCurrentUser();
  const isAuthenticated = !!user && !isLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Renzo
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#comment-ca-marche" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Comment ça marche
          </a>
          <a href="#tarifs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Tarifs
          </a>
          <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </a>

          {!mounted ? (
            // Placeholder pendant l'hydration pour éviter l'erreur
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-white">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Commencer gratuitement
                </Button>
              </Link>
            </>
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User size={16} />
                    {user?.firstName || "Mon compte"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/credits" className="cursor-pointer">
                      Crédits ({user?.creditsBalance || 0})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { /* TODO: MIGRATION */ }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut size={16} className="mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-white">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Commencer gratuitement
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="container py-4 space-y-4">
            <a href="#comment-ca-marche" className="block py-2 text-sm font-medium text-gray-600">
              Comment ça marche
            </a>
            <a href="#tarifs" className="block py-2 text-sm font-medium text-gray-600">
              Tarifs
            </a>
            <a href="#contact" className="block py-2 text-sm font-medium text-gray-600">
              Contact
            </a>
            <div className="pt-2 space-y-2">
              {!mounted ? (
                <>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Commencer gratuitement
                    </Button>
                  </Link>
                </>
              ) : isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard/settings" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Paramètres
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600"
                    onClick={() => { /* TODO: MIGRATION */ }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Commencer gratuitement
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {/* TODO: MIGRATION -       <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} /> */}
    </nav>
  );
}
