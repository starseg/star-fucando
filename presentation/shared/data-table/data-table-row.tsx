import * as React from "react";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DataTableAccentColor } from "./data-table.types";

const SELECTED_BACKGROUND: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500/10 hover:bg-amber-500/15",
  emerald: "bg-emerald-500/10 hover:bg-emerald-500/15",
  sky: "bg-sky-500/10 hover:bg-sky-500/15",
};

interface DataTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  accentColor?: DataTableAccentColor;
  children: React.ReactNode;
}

export function DataTableRow({
  selected = false,
  accentColor = "amber",
  className,
  children,
  ...props
}: DataTableRowProps) {
  return (
    <TableRow
      className={cn(
        "border-b border-stone-800/60 transition-colors",
        selected ? SELECTED_BACKGROUND[accentColor] : "hover:bg-stone-800/30",
        className,
      )}
      {...props}
    >
      {children}
    </TableRow>
  );
}
