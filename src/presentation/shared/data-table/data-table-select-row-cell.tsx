import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableSelectRowCellProps {
  checked: boolean;
  onCheckedChange: () => void;
  label: string;
}

export function DataTableSelectRowCell({ checked, onCheckedChange, label }: DataTableSelectRowCellProps) {
  return (
    <TableCell className="text-center">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </TableCell>
  );
}
