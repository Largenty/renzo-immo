"use client";

import Link from "next/link";
import { Button } from "@/presentation/shared/ui/button";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/shared/ui/dropdown-menu";
import type { User as UserType } from "@/domain/auth/models/user";

interface NavbarAuthMenuProps {
  user: UserType | null;
  isLoading: boolean;
  onLogout: () => void;
}

export function NavbarAuthMenu({ user, isLoading, onLogout }: NavbarAuthMenuProps) {
  // Pas encore authentifié ou en cours de chargement
  if (!user || isLoading) {
    return (
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
    );
  }

  // Utilisateur authentifié
  return (
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
            {user.firstName || "Mon compte"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-gray-500">{user.email}</span>
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
              Crédits ({user.creditsBalance || 0})
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-600 cursor-pointer"
          >
            <LogOut size={16} className="mr-2" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
