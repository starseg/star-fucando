import { Users, Bus, Utensils, Award, HandCoins, Search, ShieldCheck, type LucideIcon } from "lucide-react";

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export function getAppNavItems(isAdmin: boolean, pendingCount: number): AppNavItem[] {
  const navItems: AppNavItem[] = [
    { label: "Consulta CNPJ", href: "/", icon: Search, badge: "Utilitário" },
    { label: "Colaboradores", href: "/colaboradores", icon: Users },
    { label: "Vale Transporte", href: "/vale-transporte", icon: Bus },
    { label: "Vale Alimentação", href: "/vale-alimentacao", icon: Utensils },
    { label: "Prêmio Assiduidade", href: "/assiduidade", icon: Award },
    { label: "Comissões", href: "/comissoes", icon: HandCoins },
  ];

  if (isAdmin) {
    navItems.push({
      label: "Aprovações",
      href: "/admin/aprovacoes",
      icon: ShieldCheck,
      badge: pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : "",
    });
  }

  return navItems;
}
