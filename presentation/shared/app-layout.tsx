"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getAppNavItems } from "./app-layout/app-nav-items";
import { AppSidebar } from "./app-layout/app-sidebar";
import { AppMobileHeader } from "./app-layout/app-mobile-header";
import { AppMobileMenu } from "./app-layout/app-mobile-menu";

interface AppLayoutProps {
  children: React.ReactNode;
  pendingCount: number;
}

export function AppLayout({ children, pendingCount }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const user = session?.user;

  // Não renderiza sidebar na rota de impressão para não poluir
  const isPrintPage = pathname.startsWith("/imprimir");

  if (isPrintPage) {
    return <main>{children}</main>;
  }

  const navItems = getAppNavItems(isAdmin, pendingCount);
  const handleSignOut = () => signOut({ callbackUrl: "/login" });

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-100">
      <AppSidebar
        navItems={navItems}
        pathname={pathname}
        pendingCount={pendingCount}
        user={user}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppMobileHeader
          isMenuOpen={isMobileMenuOpen}
          onToggleMenu={() => setIsMobileMenuOpen((open) => !open)}
        />

        {isMobileMenuOpen && (
          <AppMobileMenu
            navItems={navItems}
            pathname={pathname}
            pendingCount={pendingCount}
            user={user}
            onNavigate={() => setIsMobileMenuOpen(false)}
            onSignOut={handleSignOut}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
