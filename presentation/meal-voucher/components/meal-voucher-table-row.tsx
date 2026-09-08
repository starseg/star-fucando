import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Printer } from "lucide-react";
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
    <DataTable.Row selected={isSelected} accentColor="emerald">
      <DataTable.SelectRowCell
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(voucher.id)}
        label={`Selecionar ${voucher.employee.name}`}
      />
      <TableCell>
        <DataTable.AvatarCell
          name={voucher.employee.name}
          subtitle={`${voucher.employee.department || "Operacional"} • ${voucher.employee.role || "Colaborador"}`}
          color="emerald"
        />
      </TableCell>
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
      <TableCell className="text-right">
        <DataTable.Actions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPrint([voucher.id])}
            className="h-8 px-2.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
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
