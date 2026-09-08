import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/presentation/shared/data-table";
import type { TransportVoucherData } from "./transport-voucher-table";

interface TransportVoucherTableRowProps {
  voucher: TransportVoucherData;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onPrint: (ids: string[]) => void;
  onEdit: (voucher: TransportVoucherData) => void;
  onDelete: (voucher: TransportVoucherData) => void;
}

export function TransportVoucherTableRow({
  voucher,
  isSelected,
  isDeleting,
  onToggleSelect,
  onPrint,
  onEdit,
  onDelete,
}: TransportVoucherTableRowProps) {
  return (
    <DataTable.EntityRow
      entity={voucher}
      isSelected={isSelected}
      isDeleting={isDeleting}
      accentColor="amber"
      onToggleSelect={onToggleSelect}
      onPrint={onPrint}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <TableCell>
        <div className="space-y-0.5">
          <span className="text-sm font-semibold text-stone-200 block">{voucher.workingDays} dias úteis</span>
          <span className="text-xs text-stone-300">
            {voucher.modals.length === 2 &&
            voucher.modals.some((m) => /ida/i.test(m.name)) &&
            voucher.modals.some((m) => /volta/i.test(m.name))
              ? `Ida (${formatCurrency(voucher.inboundValue)}) + Volta (${formatCurrency(voucher.outboundValue)})`
              : voucher.modals.map((m) => m.name).join(", ")}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center font-bold text-stone-200 text-sm">{voucher.totalVouchers} un.</TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-amber-400 block">{formatCurrency(voucher.totalValue)}</span>
        {voucher.discountPercentage != null && (
          <span className="text-[10px] text-stone-300">Desc. {voucher.discountPercentage}%</span>
        )}
      </TableCell>
    </DataTable.EntityRow>
  );
}
