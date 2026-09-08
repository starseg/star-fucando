import * as React from "react";
import type { Session } from "next-auth";
import type { AppNavItem } from "./app-nav-items";
import { AppNavLink } from "./app-nav-link";
import { AppSidebarUserFooter } from "./app-sidebar-user-footer";

interface AppSidebarProps {
  navItems: AppNavItem[];
  pathname: string;
  pendingCount: number;
  user: Session["user"] | undefined;
  onSignOut: () => void;
}

export function AppSidebar({ navItems, pathname, pendingCount, user, onSignOut }: AppSidebarProps) {
  return (
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
        {navItems.map((item) => (
          <AppNavLink key={item.href} item={item} isActive={pathname === item.href} pendingCount={pendingCount} />
        ))}
      </nav>

      {user && <AppSidebarUserFooter user={user} onSignOut={onSignOut} />}
    </aside>
  );
}
