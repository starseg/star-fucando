import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { DataTableAccentColor } from "./data-table.types";

const ICON_COLOR: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const ACTION_BUTTON_COLOR: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20",
  emerald: "bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/20",
  sky: "bg-sky-500 text-stone-950 hover:bg-sky-400 shadow-sky-500/20",
  violet: "bg-violet-500 text-stone-950 hover:bg-violet-400 shadow-violet-500/20",
};

interface DataTableEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: DataTableAccentColor;
  actionLabel?: string;
  onAction?: () => void;
}

export function DataTableEmptyState({
  icon: Icon,
  title,
  description,
  color = "amber",
  actionLabel,
  onAction,
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 p-12 text-center">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border mb-3", ICON_COLOR[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-stone-200">{title}</h3>
      <p className="mt-1 text-xs text-stone-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className={cn("mt-4 font-bold shadow-md rounded-xl h-9 px-4 text-xs", ACTION_BUTTON_COLOR[color])}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
