"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { deleteEmployee } from "@/use-cases/employee/use-cases/delete-employee";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { EmployeeDialog } from "./employee-dialog";
import { EmployeeTableRow } from "./employee-table-row";

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
    commission: number;
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

  const confirmDelete = (employee: EmployeeData) =>
    deleteWithConfirmation(
      employee.id,
      `Excluir o colaborador "${employee.name}"? Todos os lançamentos vinculados a ele também serão removidos.`,
      "Colaborador removido com sucesso!",
      "Erro ao remover colaborador."
    );

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
            <EmployeeTableRow
              key={employee.id}
              employee={employee}
              isDeleting={deletingId === employee.id}
              onEdit={openEmployeeEditDialog}
              onDelete={confirmDelete}
            />
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
