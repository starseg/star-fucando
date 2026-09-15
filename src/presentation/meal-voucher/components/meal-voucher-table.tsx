"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Utensils } from "lucide-react";
import { deleteMealVoucher } from "@/use-cases/meal-voucher/use-cases/delete-meal-voucher";
import { mealVoucherCopyConfig } from "../meal-voucher-copy-config";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { useRowSelection } from "@/presentation/shared/hooks/use-row-selection";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { MealVoucherDialog } from "./meal-voucher-dialog";
import { MealVoucherTableRow } from "./meal-voucher-table-row";
import { toast } from "sonner";

export interface MealVoucherData {
  id: string;
  employeeId: string;
  referenceMonth: Date | string;
  unitValue: number;
  workedDays: number;
  voucherCount: number;
  totalValue: number;
  discounts: number;
  netValue: number;
  employee: {
    id: string;
    name: string;
    department: string | null;
    role: string | null;
  };
}

interface MealVoucherTableProps {
  vouchers: MealVoucherData[];
  month: number;
  year: number;
}

export function MealVoucherTable({
  vouchers,
  month,
  year,
}: MealVoucherTableProps) {
  const router = useRouter();
  const {
    selectedIds,
    allSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useRowSelection(vouchers);
  const [editingVoucher, setEditingVoucher] =
    React.useState<MealVoucherData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(
    deleteMealVoucher,
    {
      onDeleted: () => router.refresh(),
    },
  );

  const openEditDialog = (voucher: MealVoucherData) => {
    setEditingVoucher(voucher);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (voucher: MealVoucherData) =>
    deleteWithConfirmation(
      voucher.id,
      `Excluir o Vale Alimentação de "${voucher.employee.name}"?`,
      "Lançamento excluído com sucesso!",
      "Erro ao excluir lançamento.",
    );

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=alimentacao&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning(
        "Selecione pelo menos um lançamento para imprimir o relatório.",
      );
      return;
    }
    window.open(
      `/imprimir-contabilidade?tipo=alimentacao&ids=${ids.join(",")}&mes=${month}&ano=${year}`,
      "_blank",
    );
  };

  if (vouchers.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={Utensils}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar um novo lançamento ou copiar os dados do mês selecionado com 1 clique."
          color="emerald"
          actionLabel="Copiar Lançamentos do Mês Anterior"
          onAction={() => setIsCopyDialogOpen(true)}
        />

        <CopyPreviousMonthDialog
          isOpen={isCopyDialogOpen}
          onClose={() => setIsCopyDialogOpen(false)}
          onSuccess={() => router.refresh()}
          targetMonth={month}
          targetYear={year}
          config={mealVoucherCopyConfig}
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
          <DataTable.HeadCell>Dias / Diária</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">
            Total Bruto
          </DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">
            Valor Líquido
          </DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">
            Ações
          </DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {vouchers.map((voucher) => (
            <MealVoucherTableRow
              key={voucher.id}
              voucher={voucher}
              isSelected={selectedIds.includes(voucher.id)}
              isDeleting={deletingId === voucher.id}
              onToggleSelect={toggleSelect}
              onPrint={printReceipts}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
            />
          ))}
        </DataTable.Body>
      </DataTable.Root>

      <MealVoucherDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => router.refresh()}
        voucherToEdit={editingVoucher}
        defaultMonth={month}
        defaultYear={year}
      />

      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={vouchers.length}
        onPrint={() => printReceipts(selectedIds)}
        onPrintAccounting={() => printAccountingReport(selectedIds)}
        onClear={clearSelection}
        benefitType="Vale Alimentação"
      />
    </>
  );
}
