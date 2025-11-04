"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/presentation/shared/ui/button";
import { gsap } from "@/lib/gsap-utils";
import { Menu, X } from "lucide-react";
import { useCurrentUser } from "@/domain/auth";
import { LogoutModal } from "@/presentation/shared/modals/logout-modal";
import { NavbarAuthMenu } from "./navbar-auth-menu";
import { NavbarMobileMenu } from "./navbar-mobile-menu";

const navLinks = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use React Query for user state
  const { data: user, isLoading } = useCurrentUser();

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

  const handleLogout = () => {
    setLogoutModalOpen(true);
    setMobileMenuOpen(false);
  };

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
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* Auth Menu - Affiche un placeholder pendant l'hydration pour éviter les erreurs */}
          {!mounted ? (
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
          ) : (
            <NavbarAuthMenu
              user={user || null}
              isLoading={isLoading}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && mounted && (
        <NavbarMobileMenu
          user={user || null}
          isLoading={isLoading}
          onLogout={handleLogout}
        />
      )}

      {/* Logout Modal */}
      <LogoutModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />
    </nav>
  );
}
