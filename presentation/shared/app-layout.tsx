"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Bus,
  Utensils,
  Award,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { getPendingCount } from "@/application/user/user-actions";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);

  const isAdmin = session?.user?.role === "ADMIN";
  const user = session?.user;

  // Busca contagem de pendências se for admin
  React.useEffect(() => {
    if (isAdmin) {
      getPendingCount().then((res) => {
        if (res.success && typeof res.count === "number") {
          setPendingCount(res.count);
        }
      });
    }
  }, [isAdmin, pathname]);

  // Não renderiza sidebar na rota de impressão para não poluir
  const isPrintPage = pathname.startsWith("/imprimir");

  if (isPrintPage) {
    return <main>{children}</main>;
  }

  const navItems = [
    {
      label: "Consulta CNPJ",
      href: "/",
      icon: Search,
      badge: "Utilitário",
    },
    {
      label: "Colaboradores",
      href: "/colaboradores",
      icon: Users,
    },
    {
      label: "Vale Transporte",
      href: "/vale-transporte",
      icon: Bus,
    },
    {
      label: "Vale Alimentação",
      href: "/vale-alimentacao",
      icon: Utensils,
    },
    {
      label: "Prêmio Assiduidade",
      href: "/assiduidade",
      icon: Award,
    },
  ];

  if (isAdmin) {
    navItems.push({
      label: "Aprovações",
      href: "/admin/aprovacoes",
      icon: ShieldCheck,
      badge: pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : "",
    });
  }

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-stone-800 bg-[#141210]/95 backdrop-blur-md">
        <div className="flex h-16 items-center border-b border-stone-800 px-6">
          <div>
            <span className="font-bold tracking-tight text-stone-100 text-lg">Star Seg</span>
            <span className="block text-[11px] font-medium text-amber-500 uppercase tracking-wider">
              Recibos & Benefícios
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-300">
            Módulos do Sistema
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 shadow-sm"
                    : "text-stone-200 hover:bg-stone-800/60 hover:text-stone-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-amber-400" : "text-stone-300")} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      item.href === "/admin/aprovacoes" && pendingCount > 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                        : "bg-stone-800 text-stone-200"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé do Usuário Logado */}
        {user && (
          <div className="border-t border-stone-800 p-3 bg-stone-950/40">
            <div className="flex items-center justify-between gap-2 rounded-xl p-2 bg-stone-900/50 border border-stone-800/60">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.email || ""}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 rounded-full border border-stone-700 object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-200 truncate leading-tight">
                    {user.name || "Usuário"}
                  </p>
                  <p className="text-[10px] text-stone-300 font-mono truncate leading-tight mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="h-7 w-7 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 cursor-pointer rounded-lg"
                title="Sair da conta"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Mobile */}
        <header className="flex h-16 items-center justify-between border-b border-stone-800 bg-[#141210]/95 px-4 md:hidden">
          <div className="flex items-center">
            <span className="font-bold text-stone-100 text-base">Star Seg</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-stone-400 hover:text-stone-100"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-b border-stone-800 bg-[#141210] p-4 space-y-1 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-amber-500/15 text-amber-400 font-semibold"
                      : "text-stone-300 hover:bg-stone-800 hover:text-stone-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        item.href === "/admin/aprovacoes" && pendingCount > 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-stone-800 text-stone-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {user && (
              <div className="border-t border-stone-800/80 pt-3 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-xs text-stone-300 truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-xs text-rose-400 hover:bg-rose-500/10 h-7 px-2"
                >
                  Sair
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
