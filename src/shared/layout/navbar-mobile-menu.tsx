"use client";

import Link from "next/link";
import { Button } from "@/shared";
import { LogOut } from "lucide-react";
import type { User } from "@/modules/auth";

interface NavbarMobileMenuProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => void;
}

const navLinks = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

export function NavbarMobileMenu({ user, isLoading, onLogout }: NavbarMobileMenuProps) {
  const isAuthenticated = !!user && !isLoading;

  return (
    <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="container py-4 space-y-4">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block py-2 text-sm font-medium text-gray-600"
          >
            {link.label}
          </a>
        ))}

        <div className="pt-2 space-y-2">
          {isAuthenticated ? (
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
                onClick={onLogout}
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
  );
}
