import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import { DataTable } from "@/presentation/shared/data-table";
import type { EmployeeData } from "./employee-table";

interface EmployeeTableRowProps {
  employee: EmployeeData;
  isDeleting: boolean;
  onEdit: (employee: EmployeeData) => void;
  onDelete: (employee: EmployeeData) => void;
}

export function EmployeeTableRow({ employee, isDeleting, onEdit, onDelete }: EmployeeTableRowProps) {
  return (
    <DataTable.Row>
      <TableCell className="pl-5">
        <DataTable.AvatarCell name={employee.name} />
      </TableCell>
      <TableCell>
        <span
          className="text-xs font-mono text-stone-300 bg-stone-900/80 border border-stone-800/80 px-2.5 py-1 rounded-md inline-block max-w-[200px] truncate"
          title={employee.pix || "Não informada"}
        >
          {employee.pix || "Não informada"}
        </span>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-stone-200 block">{employee.role || "Colaborador"}</span>
          <span className="text-xs text-stone-300">{employee.department || "Operacional"}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs font-medium text-stone-300">{formatDate(employee.admissionDate)}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {employee._count && (
            <>
              <Badge
                variant="outline"
                className="border-amber-500/30 text-amber-400 text-[10px] bg-amber-500/5 px-2 py-0.5 rounded-md"
              >
                VT: {employee._count.transportVoucher}
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded-md"
              >
                VA: {employee._count.mealVoucher}
              </Badge>
              <Badge
                variant="outline"
                className="border-sky-500/30 text-sky-400 text-[10px] bg-sky-500/5 px-2 py-0.5 rounded-md"
              >
                Assid.: {employee._count.attendanceAward}
              </Badge>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right pr-5">
        <DataTable.Actions>
          <DataTable.IconAction icon={Edit2} onClick={() => onEdit(employee)} title="Editar colaborador" />
          <DataTable.IconAction
            icon={Trash2}
            variant="danger"
            disabled={isDeleting}
            onClick={() => onDelete(employee)}
            title="Excluir colaborador"
          />
        </DataTable.Actions>
      </TableCell>
    </DataTable.Row>
  );
}
