import * as React from "react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableHeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export function DataTableHeadCell({ className, children, ...props }: DataTableHeadCellProps) {
  return (
    <TableHead
      className={cn("text-stone-400 font-semibold text-xs uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </TableHead>
  );
}
