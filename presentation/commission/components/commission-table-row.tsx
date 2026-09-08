import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Edit2, Trash2, Printer } from "lucide-react";
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
  return (
    <DataTable.Row selected={isSelected} accentColor="violet">
      <DataTable.SelectRowCell
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(commission.id)}
        label={`Selecionar ${commission.employee.name}`}
      />
      <TableCell>
        <DataTable.AvatarCell
          name={commission.employee.name}
          subtitle={`${commission.employee.department || "Operacional"} • ${commission.employee.role || "Colaborador"}`}
          color="violet"
        />
      </TableCell>
      <TableCell className="text-xs font-medium text-stone-300">
        {formatMonthYear(commission.referenceMonth)}
      </TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-violet-400 block">{formatCurrency(commission.commissionValue)}</span>
      </TableCell>
      <TableCell className="text-right">
        <DataTable.Actions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPrint([commission.id])}
            className="h-8 px-2.5 text-xs border-violet-500/30 text-violet-400 hover:bg-violet-500/10 rounded-lg"
            title="Imprimir recibo individual"
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Recibo
          </Button>
          <DataTable.IconAction icon={Edit2} onClick={() => onEdit(commission)} title="Editar" />
          <DataTable.IconAction
            icon={Trash2}
            variant="danger"
            disabled={isDeleting}
            onClick={() => onDelete(commission)}
            title="Excluir"
          />
        </DataTable.Actions>
      </TableCell>
    </DataTable.Row>
  );
}
