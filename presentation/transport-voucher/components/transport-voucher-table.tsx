"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { deleteTransportVoucher } from "@/application/transport-voucher/use-cases/delete-transport-voucher";
import { copyTransportVouchers } from "@/application/transport-voucher/use-cases/copy-transport-vouchers";
import { DataTable } from "@/presentation/shared/data-table";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { TransportVoucherDialog } from "./transport-voucher-dialog";
import { TransportVoucherDeleteDialog } from "./transport-voucher-delete-dialog";
import { TransportVoucherTableRow } from "./transport-voucher-table-row";
import { toast } from "sonner";

export interface TransportVoucherData {
  id: string;
  employeeId: string;
  referenceMonth: Date | string;
  inboundValue: number;
  outboundValue: number;
  weekendHolidayValue: number | null;
  workingDays: number;
  weekendHolidayDays: number;
  nightJokerIndicator: boolean;
  totalVouchers: number;
  totalValue: number;
  discountPercentage: number | null;
  observations: string | null;
  employee: {
    id: string;
    name: string;
    department: string | null;
    role: string | null;
  };
  modals: {
    id: string;
    name: string;
    unitValue: number;
    quantity: number;
    subtotal: number;
  }[];
}

interface TransportVoucherTableProps {
  vouchers: TransportVoucherData[];
  month: number;
  year: number;
}

export function TransportVoucherTable({
  vouchers,
  month,
  year,
}: TransportVoucherTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingVoucher, setEditingVoucher] =
    React.useState<TransportVoucherData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);
  const [voucherToDelete, setVoucherToDelete] =
    React.useState<TransportVoucherData | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const allSelected =
    vouchers.length > 0 && selectedIds.length === vouchers.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? vouchers.map((v) => v.id) : []);
  };

  const openEditDialog = (voucher: TransportVoucherData) => {
    setEditingVoucher(voucher);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!voucherToDelete) return;
    const id = voucherToDelete.id;

    setDeletingId(id);
    try {
      const res = await deleteTransportVoucher(id);
      if (res.success) {
        toast.success("Lançamento excluído com sucesso!");
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao excluir lançamento.");
      }
    } catch {
      toast.error("Erro inesperado.");
    } finally {
      setDeletingId(null);
      setVoucherToDelete(null);
    }
  };

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=transporte&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning(
        "Selecione pelo menos um lançamento para imprimir o relatório.",
      );
      return;
    }
    window.open(
      `/imprimir-contabilidade?tipo=transporte&ids=${ids.join(",")}&mes=${month}&ano=${year}`,
      "_blank",
    );
  };

  if (vouchers.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={Bus}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar um novo lançamento ou copiar os dados do mês anterior com 1 clique."
          actionLabel="Copiar Lançamentos do Mês Anterior"
          onAction={() => setIsCopyDialogOpen(true)}
        />

        <CopyPreviousMonthDialog
          isOpen={isCopyDialogOpen}
          onClose={() => setIsCopyDialogOpen(false)}
          onSuccess={() => router.refresh()}
          targetMonth={month}
          targetYear={year}
          benefitTitle="Vale Transporte"
          accentColor="amber"
          onCopy={copyTransportVouchers}
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
          <DataTable.HeadCell>Dias Úteis / Trajeto</DataTable.HeadCell>
          <DataTable.HeadCell className="text-center">
            Qtd. Vales
          </DataTable.HeadCell>
          <DataTable.HeadCell className="text-right">
            Valor Total
          </DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">
            Ações
          </DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {vouchers.map((voucher) => (
            <TransportVoucherTableRow
              key={voucher.id}
              voucher={voucher}
              isSelected={selectedIds.includes(voucher.id)}
              isDeleting={deletingId === voucher.id}
              onToggleSelect={toggleSelect}
              onPrint={printReceipts}
              onEdit={openEditDialog}
              onDelete={setVoucherToDelete}
            />
          ))}
        </DataTable.Body>
      </DataTable.Root>

      <TransportVoucherDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => router.refresh()}
        voucherToEdit={editingVoucher}
        defaultMonth={month}
        defaultYear={year}
      />

      <TransportVoucherDeleteDialog
        voucher={voucherToDelete}
        isDeleting={!!deletingId}
        onCancel={() => setVoucherToDelete(null)}
        onConfirm={confirmDelete}
      />

      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={vouchers.length}
        onPrint={() => printReceipts(selectedIds)}
        onPrintAccounting={() => printAccountingReport(selectedIds)}
        onClear={() => setSelectedIds([])}
        benefitType="Vale Transporte"
      />
    </>
  );
}
