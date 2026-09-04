"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Printer, Utensils } from "lucide-react";
import { deleteMealVoucher, copyMealVouchers } from "@/application/meal-voucher/meal-voucher-actions";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { MealVoucherDialog } from "./meal-voucher-dialog";
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

export function MealVoucherTable({ vouchers, month, year }: MealVoucherTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingVoucher, setEditingVoucher] = React.useState<MealVoucherData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(deleteMealVoucher, {
    onDeleted: () => router.refresh(),
  });

  const allSelected = vouchers.length > 0 && selectedIds.length === vouchers.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? vouchers.map((v) => v.id) : []);
  };

  const openEditDialog = (voucher: MealVoucherData) => {
    setEditingVoucher(voucher);
    setIsEditDialogOpen(true);
  };

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=alimentacao&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir o relatório.");
      return;
    }
    window.open(`/imprimir-contabilidade?tipo=alimentacao&ids=${ids.join(",")}&mes=${month}&ano=${year}`, "_blank");
  };

  if (vouchers.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={Utensils}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar um novo lançamento ou copiar os dados do mês anterior com 1 clique."
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
          benefitTitle="Vale Alimentação"
          accentColor="emerald"
          onCopy={copyMealVouchers}
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
          <DataTable.HeadCell>Dias / Diária</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">Total Bruto</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">Valor Líquido</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">Ações</DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {vouchers.map((voucher) => {
            const isSelected = selectedIds.includes(voucher.id);
            return (
              <DataTable.Row key={voucher.id} selected={isSelected} accentColor="emerald">
                <DataTable.SelectRowCell
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(voucher.id)}
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
                  <span className="text-base font-black text-emerald-400 block">
                    {formatCurrency(voucher.netValue)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DataTable.Actions>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printReceipts([voucher.id])}
                      className="h-8 px-2.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                      title="Imprimir recibo individual"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Recibo
                    </Button>
                    <DataTable.IconAction icon={Edit2} onClick={() => openEditDialog(voucher)} title="Editar" />
                    <DataTable.IconAction
                      icon={Trash2}
                      variant="danger"
                      disabled={deletingId === voucher.id}
                      onClick={() =>
                        deleteWithConfirmation(
                          voucher.id,
                          `Excluir o Vale Alimentação de "${voucher.employee.name}"?`,
                          "Lançamento excluído com sucesso!",
                          "Erro ao excluir lançamento.",
                        )
                      }
                      title="Excluir"
                    />
                  </DataTable.Actions>
                </TableCell>
              </DataTable.Row>
            );
          })}
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
        onClear={() => setSelectedIds([])}
        benefitType="Vale Alimentação"
      />
    </>
  );
}
