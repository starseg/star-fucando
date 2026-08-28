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
import { Badge } from "@/components/ui/badge";
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
  onCopyPreviousMonth?: () => void;
}

export function AttendanceAwardTable({
  awards,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onRefresh,
  onPrint,
  onCopyPreviousMonth,
}: AttendanceAwardTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const allSelected = awards.length > 0 && selectedIds.length === awards.length;

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Excluir a premiação de assiduidade de "${employeeName}"?`)) {
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
          <Award className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-stone-200">Nenhum lançamento encontrado</h3>
        <p className="mt-1 text-xs text-stone-400 max-w-sm">
          Você pode cadastrar uma nova bonificação ou copiar os dados do mês anterior com 1 clique.
        </p>
        {onCopyPreviousMonth && (
          <Button
            onClick={onCopyPreviousMonth}
            className="mt-4 bg-sky-500 text-stone-950 hover:bg-sky-400 font-bold shadow-md shadow-sky-500/20 rounded-xl h-9 px-4 text-xs"
          >
            Copiar Premiações do Mês Anterior
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-800/90 bg-[#12100e]/80 backdrop-blur-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-stone-950/80 border-b border-stone-800">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-12 text-center">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Colaborador
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Competência
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right">
              Valor da Bonificação
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right w-36">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {awards.map((award) => {
            const isSelected = selectedIds.includes(award.id);

            return (
              <TableRow
                key={award.id}
                className={`border-b border-stone-800/60 transition-colors ${
                  isSelected ? "bg-sky-500/10 hover:bg-sky-500/15" : "hover:bg-stone-800/30"
                }`}
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(award.id)}
                    aria-label={`Selecionar ${award.employee.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black border bg-sky-500/10 text-sky-400 border-sky-500/20">
                      {award.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-stone-100 text-sm block">
                        {award.employee.name}
                      </span>
                      <span className="text-xs text-stone-300">
                        {award.employee.department || "Operacional"} • {award.employee.role || "Colaborador"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-stone-300">
                  {formatMonthYear(award.referenceMonth)}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-base font-black text-sky-400 block">
                    {formatCurrency(award.bonusValue)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrint([award.id])}
                      className="h-8 px-2.5 text-xs border-sky-500/30 text-sky-400 hover:bg-sky-500/10 rounded-lg"
                      title="Imprimir recibo individual"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Recibo
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(award)}
                      className="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(award.id, award.employee.name)}
                      disabled={deletingId === award.id}
                      className="h-8 w-8 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
