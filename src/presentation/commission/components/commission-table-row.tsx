import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { formatCommissionPeriod, formatCurrency, formatDate, formatMonthYear } from "@/lib/utils";
import { DataTable } from "@/presentation/shared/data-table";
import type { CommissionData } from "./commission-table";

interface CommissionTableRowProps {
  commission: CommissionData;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPrint: (ids: string[]) => void;
  onEdit: (commission: CommissionData) => void;
  onDelete: (commission: CommissionData) => void;
}

export function CommissionTableRow({
  commission,
  isSelected,
  isDeleting,
  onToggleSelect,
  onPrint,
  onEdit,
  onDelete,
}: CommissionTableRowProps) {
  const defaultPeriod = formatCommissionPeriod(commission.referenceMonth);
  const periodText = commission.startDate && commission.endDate
    ? `${formatDate(commission.startDate)} a ${formatDate(commission.endDate)}`
    : `${defaultPeriod.periodStart} a ${defaultPeriod.periodEnd}`;

  return (
    <DataTable.EntityRow
      entity={commission}
      isSelected={isSelected}
      isDeleting={isDeleting}
      accentColor="violet"
      onToggleSelect={onToggleSelect}
      onPrint={onPrint}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <TableCell className="text-xs font-medium text-stone-300">
        <div>{formatMonthYear(commission.referenceMonth)}</div>
        <div className="text-[10px] text-stone-400 mt-0.5">{periodText}</div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-violet-400 block">{formatCurrency(commission.commissionValue)}</span>
      </TableCell>
    </DataTable.EntityRow>
  );
}
