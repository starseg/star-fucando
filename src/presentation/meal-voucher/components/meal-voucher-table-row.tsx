import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/presentation/shared/data-table";
import type { MealVoucherData } from "./meal-voucher-table";

interface MealVoucherTableRowProps {
  voucher: MealVoucherData;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPrint: (ids: string[]) => void;
  onEdit: (voucher: MealVoucherData) => void;
  onDelete: (voucher: MealVoucherData) => void;
}

export function MealVoucherTableRow({
  voucher,
  isSelected,
  isDeleting,
  onToggleSelect,
  onPrint,
  onEdit,
  onDelete,
}: MealVoucherTableRowProps) {
  return (
    <DataTable.EntityRow
      entity={voucher}
      isSelected={isSelected}
      isDeleting={isDeleting}
      accentColor="emerald"
      onToggleSelect={onToggleSelect}
      onPrint={onPrint}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <TableCell>
        <div className="space-y-0.5">
          <span className="text-sm font-semibold text-stone-200 block">
            {voucher.workedDays} {voucher.workedDays === 1 ? "dia" : "dias"}
          </span>
          <span className="text-xs text-stone-300">Diária de {formatCurrency(voucher.unitValue)}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-sm font-semibold text-stone-300 block">
          {formatCurrency(voucher.totalValue)}
        </span>
        {voucher.discounts > 0 && (
          <span className="text-[10px] text-red-400">Desc. -{formatCurrency(voucher.discounts)}</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-emerald-400 block">{formatCurrency(voucher.netValue)}</span>
      </TableCell>
    </DataTable.EntityRow>
  );
}
