import * as React from "react";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import type { AppNavItem } from "./app-nav-items";
import { AppNavLink } from "./app-nav-link";
import { useAppLayoutUser } from "./app-layout-context";

interface AppMobileMenuProps {
  navItems: AppNavItem[];
  pathname: string;
  onNavigate: () => void;
}

export function AppMobileMenu({ navItems, pathname, onNavigate }: AppMobileMenuProps) {
  const { user, onSignOut } = useAppLayoutUser();

  return (
    <div className="border-b border-stone-800 bg-[#141210] p-4 space-y-1 md:hidden">
      {navItems.map((item) => (
        <AppNavLink
          key={item.href}
          item={item}
          isActive={pathname === item.href}
          variant="mobile"
          onClick={onNavigate}
        />
      ))}

      {user && (
        <div className="border-t border-stone-800/80 pt-3 mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
            </div>
            <span className="text-xs text-stone-300 truncate max-w-[180px]">{user.email}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSignOut}
            className="text-xs text-rose-400 hover:bg-rose-500/10 h-7 px-2"
          >
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}
