import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Edit2, Trash2, Printer } from "lucide-react";
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
    <DataTable.Row selected={isSelected} accentColor="sky">
      <DataTable.SelectRowCell
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(award.id)}
        label={`Selecionar ${award.employee.name}`}
      />
      <TableCell>
        <DataTable.AvatarCell
          name={award.employee.name}
          subtitle={`${award.employee.department || "Operacional"} • ${award.employee.role || "Colaborador"}`}
          color="sky"
        />
      </TableCell>
      <TableCell className="text-xs font-medium text-stone-300">
        {formatMonthYear(award.referenceMonth)}
      </TableCell>
      <TableCell className="text-right">
        <span className="text-base font-black text-sky-400 block">{formatCurrency(award.bonusValue)}</span>
      </TableCell>
      <TableCell className="text-right">
        <DataTable.Actions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPrint([award.id])}
            className="h-8 px-2.5 text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10 rounded-lg"
            title="Imprimir recibo individual"
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Recibo
          </Button>
          <DataTable.IconAction icon={Edit2} onClick={() => onEdit(award)} title="Editar" />
          <DataTable.IconAction
            icon={Trash2}
            variant="danger"
            disabled={isDeleting}
            onClick={() => onDelete(award)}
            title="Excluir"
          />
        </DataTable.Actions>
      </TableCell>
    </DataTable.Row>
  );
}
