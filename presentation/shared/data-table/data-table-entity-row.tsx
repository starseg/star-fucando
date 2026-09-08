import * as React from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTableRow } from "./data-table-row";
import { DataTableSelectRowCell } from "./data-table-select-row-cell";
import { DataTableAvatarCell } from "./data-table-avatar-cell";
import { DataTableActions } from "./data-table-actions";
import { DataTableIconAction } from "./data-table-icon-action";
import type { DataTableAccentColor } from "./data-table.types";

const PRINT_BUTTON_COLOR: Record<DataTableAccentColor, string> = {
  amber: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
  emerald: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
  sky: "border-sky-500/30 text-sky-400 hover:bg-sky-500/10",
  violet: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
};

export interface DataTableEntityRowProps<
  T extends {
    id: string;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
    };
  },
> {
  entity: T;
  isSelected: boolean;
  isDeleting?: boolean;
  accentColor?: DataTableAccentColor;
  onToggleSelect: (id: string) => void;
  onPrint: (ids: string[]) => void;
  onEdit: (entity: T) => void;
  onDelete: (entity: T) => void;
  children: React.ReactNode;
}

export function DataTableEntityRow<
  T extends {
    id: string;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
    };
  },
>({
  entity,
  isSelected,
  isDeleting = false,
  accentColor = "amber",
  onToggleSelect,
  onPrint,
  onEdit,
  onDelete,
  children,
}: DataTableEntityRowProps<T>) {
  return (
    <DataTableRow selected={isSelected} accentColor={accentColor}>
      <DataTableSelectRowCell
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(entity.id)}
        label={`Selecionar ${entity.employee.name}`}
      />
      <TableCell>
        <DataTableAvatarCell
          name={entity.employee.name}
          subtitle={`${entity.employee.department || "Operacional"} • ${entity.employee.role || "Colaborador"}`}
          color={accentColor}
        />
      </TableCell>
      {children}
      <TableCell className="text-right">
        <DataTableActions>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPrint([entity.id])}
            className={cn(
              "h-8 px-2.5 text-xs rounded-lg",
              PRINT_BUTTON_COLOR[accentColor],
            )}
            title="Imprimir recibo individual"
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Recibo
          </Button>
          <DataTableIconAction
            icon={Edit2}
            onClick={() => onEdit(entity)}
            title="Editar"
          />
          <DataTableIconAction
            icon={Trash2}
            variant="danger"
            disabled={isDeleting}
            onClick={() => onDelete(entity)}
            title="Excluir"
          />
        </DataTableActions>
      </TableCell>
    </DataTableRow>
  );
}
