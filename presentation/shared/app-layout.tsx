"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Bus,
  Utensils,
  Award,
  Search,
  ReceiptText,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-stone-800 bg-[#141210]/95 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 border-b border-stone-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-stone-100 text-base">Star Seg</span>
            <span className="block text-[11px] font-medium text-amber-500 uppercase tracking-wider">Recibos & Benefícios</span>
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
                  <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-semibold text-stone-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-800 p-4">
          <div className="rounded-lg bg-stone-900/90 border border-stone-800/80 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 mb-1">
              <ReceiptText className="h-3.5 w-3.5 text-amber-400" />
              <span>Geração de Recibos</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Selecione os registros nas tabelas e imprima recibos individuais ou em lote.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Mobile */}
        <header className="flex h-16 items-center justify-between border-b border-stone-800 bg-[#141210]/95 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-stone-950 font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-stone-100 text-sm">Star Seg</span>
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
                </Link>
              );
            })}
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
