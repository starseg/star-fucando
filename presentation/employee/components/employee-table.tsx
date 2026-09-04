"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Edit2, Trash2, User } from "lucide-react";
import { deleteEmployee } from "@/application/employee/use-cases/delete-employee";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { EmployeeDialog } from "./employee-dialog";

export interface EmployeeData {
  id: string;
  name: string;
  pix?: string | null;
  department: string | null;
  role: string | null;
  admissionDate: Date | string | null;
  createdAt: Date | string;
  _count?: {
    transportVoucher: number;
    mealVoucher: number;
    attendanceAward: number;
  };
}

interface EmployeeTableProps {
  employees: EmployeeData[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();
  const [editingEmployee, setEditingEmployee] = React.useState<EmployeeData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(deleteEmployee, {
    onDeleted: () => router.refresh(),
  });

  const openEmployeeEditDialog = (employee: EmployeeData) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  if (employees.length === 0) {
    return (
      <DataTable.EmptyState
        icon={User}
        title="Nenhum colaborador cadastrado"
        description="Cadastre os funcionários da Star Seg para gerenciar benefícios e emitir recibos."
      />
    );
  }

  return (
    <>
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.HeadCell className="pl-5">Colaborador</DataTable.HeadCell>
          <DataTable.HeadCell>Chave PIX</DataTable.HeadCell>
          <DataTable.HeadCell>Departamento / Função</DataTable.HeadCell>
          <DataTable.HeadCell>Data de Admissão</DataTable.HeadCell>
          <DataTable.HeadCell className="text-center">Histórico de Benefícios</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right pr-5 w-28">Ações</DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {employees.map((employee) => (
            <DataTable.Row key={employee.id}>
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
                  <span className="text-sm font-medium text-stone-200 block">
                    {employee.role || "Colaborador"}
                  </span>
                  <span className="text-xs text-stone-300">{employee.department || "Operacional"}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs font-medium text-stone-300">
                {formatDate(employee.admissionDate)}
              </TableCell>
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
                  <DataTable.IconAction
                    icon={Edit2}
                    onClick={() => openEmployeeEditDialog(employee)}
                    title="Editar colaborador"
                  />
                  <DataTable.IconAction
                    icon={Trash2}
                    variant="danger"
                    disabled={deletingId === employee.id}
                    onClick={() =>
                      deleteWithConfirmation(
                        employee.id,
                        `Excluir o colaborador "${employee.name}"? Todos os lançamentos vinculados a ele também serão removidos.`,
                        "Colaborador removido com sucesso!",
                        "Erro ao remover colaborador.",
                      )
                    }
                    title="Excluir colaborador"
                  />
                </DataTable.Actions>
              </TableCell>
            </DataTable.Row>
          ))}
        </DataTable.Body>
      </DataTable.Root>

      <EmployeeDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => router.refresh()}
        employeeToEdit={editingEmployee}
      />
    </>
  );
}
