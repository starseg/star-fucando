import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AppNavItem } from "./app-nav-items";

interface AppNavLinkProps {
  item: AppNavItem;
  isActive: boolean;
  pendingCount: number;
  variant?: "desktop" | "mobile";
  onClick?: () => void;
}

export function AppNavLink({ item, isActive, pendingCount, variant = "desktop", onClick }: AppNavLinkProps) {
  const Icon = item.icon;
  const isDesktop = variant === "desktop";
  const isAdminBadgeHighlighted = item.href === "/admin/aprovacoes" && pendingCount > 0;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg text-sm font-medium",
        isDesktop ? "px-3 py-2.5 transition-all duration-150" : "px-3 py-2",
        isActive
          ? isDesktop
            ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30 shadow-sm"
            : "bg-amber-500/15 text-amber-400 font-semibold"
          : isDesktop
            ? "text-stone-200 hover:bg-stone-800/60 hover:text-stone-100"
            : "text-stone-300 hover:bg-stone-800 hover:text-stone-100"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", isDesktop && (isActive ? "text-amber-400" : "text-stone-300"))} />
        <span>{item.label}</span>
      </div>
      {item.badge && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
            isAdminBadgeHighlighted
              ? cn("bg-amber-500/20 text-amber-400 border border-amber-500/30", isDesktop && "font-bold")
              : "bg-stone-800 text-stone-200"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
