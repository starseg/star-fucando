import * as React from "react";
import { cn } from "@/lib/utils";
import type { DataTableAccentColor } from "./data-table.types";

const AVATAR_COLOR: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

interface DataTableAvatarCellProps {
  name: string;
  subtitle?: React.ReactNode;
  color?: DataTableAccentColor;
}

export function DataTableAvatarCell({ name, subtitle, color = "amber" }: DataTableAvatarCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black border",
          AVATAR_COLOR[color],
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div>
        <span className="font-bold text-stone-100 text-sm block">{name}</span>
        {subtitle && <span className="text-xs text-stone-300">{subtitle}</span>}
      </div>
    </div>
  );
}
