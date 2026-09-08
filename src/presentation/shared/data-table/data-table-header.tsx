import * as React from "react";
import { TableHeader, TableRow } from "@/components/ui/table";

interface DataTableHeaderProps {
  children: React.ReactNode;
}

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return (
    <TableHeader className="bg-stone-950/80 border-b border-stone-800">
      <TableRow className="border-none hover:bg-transparent">{children}</TableRow>
    </TableHeader>
  );
}
