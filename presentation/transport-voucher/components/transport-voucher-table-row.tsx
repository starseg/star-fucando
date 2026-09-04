import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Printer } from "lucide-react";
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
    <DataTable.Row selected={isSelected}>
      <DataTable.SelectRowCell
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(voucher.id)}
        label={`Selecionar ${voucher.employee.name}`}
      />
      <TableCell>
        <DataTable.AvatarCell
          name={voucher.employee.name}
          subtitle={`${voucher.employee.department || "Operacional"} • ${voucher.employee.role || "Colaborador"}`}
        />
      </TableCell>
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
      <TableCell className="text-right">
        <DataTable.Actions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPrint([voucher.id])}
            className="h-8 px-2.5 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg"
            title="Imprimir recibo individual"
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Recibo
          </Button>
          <DataTable.IconAction icon={Edit2} onClick={() => onEdit(voucher)} title="Editar" />
          <DataTable.IconAction
            icon={Trash2}
            variant="danger"
            disabled={isDeleting}
            onClick={() => onDelete(voucher)}
            title="Excluir"
          />
        </DataTable.Actions>
      </TableCell>
    </DataTable.Row>
  );
}
