"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Edit2, Trash2, Printer, Award } from "lucide-react";
import { deleteAttendanceAward } from "@/application/attendance-award/use-cases/delete-attendance-award";
import { copyAttendanceAwards } from "@/application/attendance-award/use-cases/copy-attendance-awards";
import { DataTable } from "@/presentation/shared/data-table";
import { useDeleteWithConfirmation } from "@/presentation/shared/hooks/use-delete-with-confirmation";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { AttendanceAwardDialog } from "./attendance-award-dialog";
import { toast } from "sonner";

export interface AttendanceAwardData {
  id: string;
  employeeId: string;
  referenceMonth: Date | string;
  bonusValue: number;
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

export function AttendanceAwardTable({ awards, month, year }: AttendanceAwardTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingAward, setEditingAward] = React.useState<AttendanceAwardData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);

  const { deletingId, deleteWithConfirmation } = useDeleteWithConfirmation(deleteAttendanceAward, {
    onDeleted: () => router.refresh(),
  });

  const allSelected = awards.length > 0 && selectedIds.length === awards.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? awards.map((a) => a.id) : []);
  };

  const openEditDialog = (award: AttendanceAwardData) => {
    setEditingAward(award);
    setIsEditDialogOpen(true);
  };

  const printReceipts = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    window.open(`/imprimir?tipo=assiduidade&ids=${ids.join(",")}`, "_blank");
  };

  const printAccountingReport = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir o relatório.");
      return;
    }
    window.open(`/imprimir-contabilidade?tipo=assiduidade&ids=${ids.join(",")}&mes=${month}&ano=${year}`, "_blank");
  };

  if (awards.length === 0) {
    return (
      <>
        <DataTable.EmptyState
          icon={Award}
          title="Nenhum lançamento encontrado"
          description="Você pode cadastrar uma nova bonificação ou copiar os dados do mês anterior com 1 clique."
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
          benefitTitle="Prêmio de Assiduidade"
          accentColor="sky"
          onCopy={copyAttendanceAwards}
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
          <DataTable.HeadCell className="text-right">Valor da Bonificação</DataTable.HeadCell>
          <DataTable.HeadCell className="text-right w-36">Ações</DataTable.HeadCell>
        </DataTable.Header>
        <DataTable.Body>
          {awards.map((award) => {
            const isSelected = selectedIds.includes(award.id);
            return (
              <DataTable.Row key={award.id} selected={isSelected} accentColor="sky">
                <DataTable.SelectRowCell
                  checked={isSelected}
                  onCheckedChange={() => toggleSelect(award.id)}
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
                      onClick={() => printReceipts([award.id])}
                      className="h-8 px-2.5 text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10 rounded-lg"
                      title="Imprimir recibo individual"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Recibo
                    </Button>
                    <DataTable.IconAction icon={Edit2} onClick={() => openEditDialog(award)} title="Editar" />
                    <DataTable.IconAction
                      icon={Trash2}
                      variant="danger"
                      disabled={deletingId === award.id}
                      onClick={() =>
                        deleteWithConfirmation(
                          award.id,
                          `Excluir a premiação de assiduidade de "${award.employee.name}"?`,
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
        onClear={() => setSelectedIds([])}
        benefitType="Prêmio de Assiduidade"
      />
    </>
  );
}
