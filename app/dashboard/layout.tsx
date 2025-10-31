"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sparkles,
  User,
  Palette,
  Sofa,
  Home,
} from "lucide-react";
import { LogoutModal } from "@/components/modals/logout-modal";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuthStore, useCreditsStore } from "@/lib/stores";
import { logger } from '@/lib/logger';

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes projets", href: "/dashboard/projects", icon: FolderOpen },
  { name: "Mes styles", href: "/dashboard/styles", icon: Palette },
  { name: "Meubles", href: "/dashboard/furniture", icon: Sofa },
  { name: "Pièces", href: "/dashboard/rooms", icon: Home },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
  { name: "Crédits", href: "/dashboard/credits", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // UNIQUEMENT Zustand stores
  const { user, isLoading } = useAuthStore();
  const { balance: creditsBalance, fetchBalance } = useCreditsStore();

  // Charger les crédits quand l'utilisateur est chargé
  useEffect(() => {
    if (user?.id) {
      fetchBalance(user.id);
    }
  }, [user?.id, fetchBalance]);

  // ⚠️ IMPORTANT: Ne pas faire de redirection côté client ici
  // Le middleware s'occupe déjà de protéger les routes /dashboard
  // Rediriger ici créerait une boucle infinie avec le middleware

  // Afficher loader pendant le chargement initial du store
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas encore de user mais que le middleware nous a laissé passer,
  // afficher le loader (le user va arriver sous peu)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-slate-900">RENZO</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-slate-50">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center">
                  <User size={16} className="text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-slate-500">
                  {/* @ts-ignore - TODO: Fix User type to include subscriptionPlanId */}
                  {user?.subscriptionPlanId ? "Pro Plan" : "Free Plan"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLogoutModalOpen(true)}
              className="w-full justify-start mt-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              <LogOut size={16} className="mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-700 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Credits badge */}
            <Link href="/dashboard/credits">
              <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {creditsBalance} crédit{creditsBalance > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
