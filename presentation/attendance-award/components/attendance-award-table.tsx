"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Edit2, Trash2, Printer, Award } from "lucide-react";
import { deleteAttendanceAward } from "@/application/attendance-award/attendance-award-actions";
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
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (allSelected: boolean) => void;
  onEdit: (award: AttendanceAwardData) => void;
  onRefresh: () => void;
  onPrint: (ids: string[]) => void;
}

export function AttendanceAwardTable({
  awards,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onRefresh,
  onPrint,
}: AttendanceAwardTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const allSelected = awards.length > 0 && selectedIds.length === awards.length;

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Deseja realmente excluir a premiação de assiduidade de "${employeeName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteAttendanceAward(id);
      if (res.success) {
        toast.success("Lançamento excluído com sucesso!");
        onRefresh();
      } else {
        toast.error(res.error || "Erro ao excluir lançamento.");
      }
    } catch {
      toast.error("Erro inesperado.");
    } finally {
      setDeletingId(null);
    }
  };

  if (awards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-800 bg-stone-900/40 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-stone-400 mb-3">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-200">Nenhum lançamento no período selecionado</h3>
        <p className="mt-1 text-sm text-stone-400 max-w-sm">
          Cadastre os lançamentos de Prêmio de Assiduidade do mês para emitir os recibos correspondentes.
        </p>
      </div>
    );
  }

  const grandTotal = awards.reduce((acc, a) => acc + Number(a.bonusValue), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-800 bg-stone-900/70 backdrop-blur overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-stone-950/60">
            <TableRow className="border-stone-800 hover:bg-transparent">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="text-stone-400 font-semibold">Colaborador</TableHead>
              <TableHead className="text-stone-400 font-semibold">Competência</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Valor da Bonificação</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((award) => {
              const isSelected = selectedIds.includes(award.id);
              return (
                <TableRow
                  key={award.id}
                  className={`border-stone-800/80 transition-colors ${
                    isSelected ? "bg-sky-500/10 hover:bg-sky-500/15" : "hover:bg-stone-800/40"
                  }`}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(award.id)}
                      aria-label={`Selecionar ${award.employee.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-stone-100">
                    <div>
                      <span className="font-semibold text-stone-100">{award.employee.name}</span>
                      <span className="block text-xs text-stone-300">
                        {award.employee.department || "Geral"} • {award.employee.role || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-stone-300 text-xs">
                    {formatMonthYear(award.referenceMonth)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-sky-400">
                    {formatCurrency(award.bonusValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint([award.id])}
                        className="h-8 w-8 text-stone-400 hover:text-sky-400 hover:bg-sky-400/10"
                        title="Imprimir recibo"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(award)}
                        className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                        title="Editar lançamento"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(award.id, award.employee.name)}
                        disabled={deletingId === award.id}
                        className="h-8 w-8 text-stone-400 hover:text-red-400 hover:bg-red-400/10"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-stone-800 bg-stone-950/60 p-4">
        <div className="text-xs text-stone-400">
          Total de registros: <span className="font-semibold text-stone-200">{awards.length}</span> | 
          Selecionados: <span className="font-semibold text-sky-400">{selectedIds.length}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-stone-300 block">Total em Premiações</span>
          <span className="text-base font-black text-sky-400">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
