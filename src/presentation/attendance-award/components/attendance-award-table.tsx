"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";
import type { AttendanceAwardType } from "@prisma/client";
import { deleteAttendanceAward } from "@/use-cases/attendance-award/use-cases/delete-attendance-award";
import { attendanceAwardCopyConfig } from "../attendance-award-copy-config";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { useRowSelection } from "@/presentation/shared/hooks/use-row-selection";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { AttendanceAwardDialog } from "./attendance-award-dialog";
import { AttendanceAwardTableRow } from "./attendance-award-table-row";
import { toast } from "sonner";

export interface AttendanceAwardData {
  id: string;
  employeeId: string;
  referenceMonth: Date | string;
  bonusValue: number;
  bonusType: AttendanceAwardType;
  employee: {
    id: string;
    name: string;
    department: string | null;
    role: string | null;
  };
}

interface AttendanceAwardTableProps {
  awards: AttendanceAwardData[];
  month: number;
  year: number;
}

export function AttendanceAwardTable({
  awards,
  month,
  year,
}: AttendanceAwardTableProps) {
  const router = useRouter();
  const {
    selectedIds,
    allSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useRowSelection(awards);
  const [editingAward, setEditingAward] =
    React.useState<AttendanceAwardData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(
    deleteAttendanceAward,
    {
      onDeleted: () => router.refresh(),
    },
  );

  const openEditDialog = (award: AttendanceAwardData) => {
    setEditingAward(award);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (award: AttendanceAwardData) =>
    deleteWithConfirmation(
      award.id,
      `Excluir a premiação de assiduidade de "${award.employee.name}"?`,
      "Lançamento excluído com sucesso!",
      "Erro ao excluir lançamento.",
    );

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=assiduidade&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning(
        "Selecione pelo menos um lançamento para imprimir o relatório.",
      );
      return;
    }
    window.open(
      `/imprimir-contabilidade?tipo=assiduidade&ids=${ids.join(",")}&mes=${month}&ano=${year}`,
      "_blank",
    );
  };

  if (awards.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={Award}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar uma nova bonificação ou copiar os dados do mês selecionado com 1 clique."
          color="sky"
          actionLabel="Copiar Premiações do Mês Anterior"
          onAction={() => setIsCopyDialogOpen(true)}
        />

        <CopyPreviousMonthDialog
          isOpen={isCopyDialogOpen}
          onClose={() => setIsCopyDialogOpen(false)}
          onSuccess={() => router.refresh()}
          targetMonth={month}
          targetYear={year}
          config={attendanceAwardCopyConfig}
        />
      </>
    );
  }

  return (
    <>
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.SelectAllCell
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
          />
          <DataTable.HeadCell>Colaborador</DataTable.HeadCell>
          <DataTable.HeadCell>Competência</DataTable.HeadCell>
          <DataTable.HeadCell>Tipo</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">
            Valor da Bonificação
          </DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">
            Ações
          </DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {awards.map((award) => (
            <AttendanceAwardTableRow
              key={award.id}
              award={award}
              isSelected={selectedIds.includes(award.id)}
              isDeleting={deletingId === award.id}
              onToggleSelect={toggleSelect}
              onPrint={printReceipts}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
            />
          ))}
        </DataTable.Body>
      </DataTable.Root>

      <AttendanceAwardDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => router.refresh()}
        awardToEdit={editingAward}
        defaultMonth={month}
        defaultYear={year}
      />

      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={awards.length}
        onPrint={() => printReceipts(selectedIds)}
        onPrintAccounting={() => printAccountingReport(selectedIds)}
        onClear={clearSelection}
        benefitType="Prêmio de Assiduidade"
      />
    </>
  );
}
