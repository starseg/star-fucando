import * as React from "react";
import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppLayoutUser } from "./app-layout-context";

export function AppSidebarUserFooter() {
  const { user, onSignOut } = useAppLayoutUser();

  if (!user) {
    return null;
  }

  return (
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
          onClick={onSignOut}
          className="h-7 w-7 text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 cursor-pointer rounded-lg"
          title="Sair da conta"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
