import * as React from "react";
import { TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableSelectAllCellProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function DataTableSelectAllCell({ checked, onCheckedChange }: DataTableSelectAllCellProps) {
  return (
    <TableHead className="w-12 text-center">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        aria-label="Selecionar todos"
      />
    </TableHead>
  );
}
