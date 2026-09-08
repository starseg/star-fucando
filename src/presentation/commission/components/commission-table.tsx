"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HandCoins } from "lucide-react";
import { deleteCommission } from "@/use-cases/commission/use-cases/delete-commission";
import { commissionCopyConfig } from "../commission-copy-config";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { useRowSelection } from "@/presentation/shared/hooks/use-row-selection";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { CommissionDialog } from "./commission-dialog";
import { CommissionTableRow } from "./commission-table-row";
import { toast } from "sonner";

export interface CommissionData {
  id: string;
  employeeId: string;
  referenceMonth: Date | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  commissionValue: number;
  employee: {
    id: string;
    name: string;
    department: string | null;
    role: string | null;
  };
}

interface CommissionTableProps {
  commissions: CommissionData[];
  month: number;
  year: number;
}

export function CommissionTable({ commissions, month, year }: CommissionTableProps) {
  const router = useRouter();
  const { selectedIds, allSelected, toggleSelect, toggleSelectAll, clearSelection } = useRowSelection(commissions);
  const [editingCommission, setEditingCommission] = React.useState<CommissionData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(deleteCommission, {
    onDeleted: () => router.refresh(),
  });

  const openEditDialog = (commission: CommissionData) => {
    setEditingCommission(commission);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (commission: CommissionData) =>
    deleteWithConfirmation(
      commission.id,
      `Excluir a comissão de "${commission.employee.name}"?`,
      "Lançamento excluído com sucesso!",
      "Erro ao excluir lançamento."
    );

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=comissao&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir o relatório.");
      return;
    }
    window.open(`/imprimir-contabilidade?tipo=comissao&ids=${ids.join(",")}&mes=${month}&ano=${year}`, "_blank");
  };

  if (commissions.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={HandCoins}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar uma nova comissão ou copiar os dados do mês anterior com 1 clique."
          color="violet"
          actionLabel="Copiar Comissões do Mês Anterior"
          onAction={() => setIsCopyDialogOpen(true)}
        />

        <CopyPreviousMonthDialog
          isOpen={isCopyDialogOpen}
          onClose={() => setIsCopyDialogOpen(false)}
          onSuccess={() => router.refresh()}
          targetMonth={month}
          targetYear={year}
          config={commissionCopyConfig}
        />
      </>
    );
  }

  return (
    <>
      <DataTable.Root>
        <DataTable.Header>
          <DataTable.SelectAllCell checked={allSelected} onCheckedChange={toggleSelectAll} />
          <DataTable.HeadCell>Colaborador</DataTable.HeadCell>
          <DataTable.HeadCell>Competência</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">Valor da Comissão</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">Ações</DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {commissions.map((commission) => (
            <CommissionTableRow
              key={commission.id}
              commission={commission}
              isSelected={selectedIds.includes(commission.id)}
              isDeleting={deletingId === commission.id}
              onToggleSelect={toggleSelect}
              onPrint={printReceipts}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
            />
          ))}
        </DataTable.Body>
      </DataTable.Root>

      <CommissionDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => router.refresh()}
        commissionToEdit={editingCommission}
        defaultMonth={month}
        defaultYear={year}
      />

      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={commissions.length}
        onPrint={() => printReceipts(selectedIds)}
        onPrintAccounting={() => printAccountingReport(selectedIds)}
        onClear={clearSelection}
        benefitType="Comissão"
      />
    </>
  );
}
