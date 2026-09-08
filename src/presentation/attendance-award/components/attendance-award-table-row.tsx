import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { DataTable } from "@/presentation/shared/data-table";
import type { AttendanceAwardData } from "./attendance-award-table";

interface AttendanceAwardTableRowProps {
  award: AttendanceAwardData;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPrint: (ids: string[]) => void;
  onEdit: (award: AttendanceAwardData) => void;
  onDelete: (award: AttendanceAwardData) => void;
}

export function AttendanceAwardTableRow({
  award,
  isSelected,
  isDeleting,
  onToggleSelect,
  onPrint,
  onEdit,
  onDelete,
}: AttendanceAwardTableRowProps) {
  return (
    <DataTable.EntityRow
      entity={award}
      isSelected={isSelected}
      isDeleting={isDeleting}
      accentColor="sky"
      onToggleSelect={onToggleSelect}
      onPrint={onPrint}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <TableCell className="text-xs font-medium text-stone-300">
        {formatMonthYear(award.referenceMonth)}
      </TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-sky-400 block">{formatCurrency(award.bonusValue)}</span>
      </TableCell>
    </DataTable.EntityRow>
  );
}
