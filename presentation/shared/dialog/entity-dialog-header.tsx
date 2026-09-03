import * as React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { DataTableAccentColor } from "@/presentation/shared/data-table/data-table.types";

const ICON_COLOR: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sky: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

interface EntityDialogHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: DataTableAccentColor;
}

export function EntityDialogHeader({ icon: Icon, title, description, color = "amber" }: EntityDialogHeaderProps) {
  return (
    <DialogHeader className="pb-3 border-b border-stone-800/80">
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", ICON_COLOR[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <DialogTitle className="text-lg font-bold text-stone-100">{title}</DialogTitle>
          <DialogDescription className="text-xs text-stone-400">{description}</DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
