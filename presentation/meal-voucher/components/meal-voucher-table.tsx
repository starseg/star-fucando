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
import { Edit2, Trash2, Printer, Utensils } from "lucide-react";
import { deleteMealVoucher } from "@/application/meal-voucher/meal-voucher-actions";
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
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (allSelected: boolean) => void;
  onEdit: (voucher: MealVoucherData) => void;
  onRefresh: () => void;
  onPrint: (ids: string[]) => void;
}

export function MealVoucherTable({
  vouchers,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onRefresh,
  onPrint,
}: MealVoucherTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const allSelected = vouchers.length > 0 && selectedIds.length === vouchers.length;

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Deseja realmente excluir o Vale Alimentação de "${employeeName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteMealVoucher(id);
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

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-800 bg-stone-900/40 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-stone-400 mb-3">
          <Utensils className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-200">Nenhum lançamento no período selecionado</h3>
        <p className="mt-1 text-sm text-stone-400 max-w-sm">
          Cadastre os lançamentos de Vale Alimentação do mês para emitir os recibos correspondentes.
        </p>
      </div>
    );
  }

  const grandTotal = vouchers.reduce((acc, v) => acc + Number(v.totalValue), 0);
  const totalNet = vouchers.reduce((acc, v) => acc + Number(v.netValue), 0);

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
              <TableHead className="text-stone-400 font-semibold text-center">Dias / Vales</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Valor Diário</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Total Bruto</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Descontos</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Líquido</TableHead>
              <TableHead className="text-stone-400 font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => {
              const isSelected = selectedIds.includes(voucher.id);
              return (
                <TableRow
                  key={voucher.id}
                  className={`border-stone-800/80 transition-colors ${
                    isSelected ? "bg-emerald-500/10 hover:bg-emerald-500/15" : "hover:bg-stone-800/40"
                  }`}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(voucher.id)}
                      aria-label={`Selecionar ${voucher.employee.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-stone-100">
                    <div>
                      <span className="font-semibold text-stone-100">{voucher.employee.name}</span>
                      <span className="block text-xs text-stone-300">
                        {voucher.employee.department || "Geral"} • {voucher.employee.role || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-stone-300 text-xs">
                    {formatMonthYear(voucher.referenceMonth)}
                  </TableCell>
                  <TableCell className="text-center text-stone-300 text-xs font-medium">
                    {voucher.workedDays} dias ({voucher.voucherCount} vales)
                  </TableCell>
                  <TableCell className="text-right text-stone-300 text-xs">
                    {formatCurrency(voucher.unitValue)}
                  </TableCell>
                  <TableCell className="text-right text-stone-200 text-xs font-semibold">
                    {formatCurrency(voucher.totalValue)}
                  </TableCell>
                  <TableCell className="text-right text-red-400 text-xs">
                    {voucher.discounts > 0 ? `-${formatCurrency(voucher.discounts)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-400">
                    {formatCurrency(voucher.netValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint([voucher.id])}
                        className="h-8 w-8 text-stone-400 hover:text-emerald-400 hover:bg-emerald-400/10"
                        title="Imprimir recibo"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(voucher)}
                        className="h-8 w-8 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                        title="Editar lançamento"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(voucher.id, voucher.employee.name)}
                        disabled={deletingId === voucher.id}
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
          Total de registros: <span className="font-semibold text-stone-200">{vouchers.length}</span> | 
          Selecionados: <span className="font-semibold text-emerald-400">{selectedIds.length}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-stone-300 block">Total Bruto</span>
            <span className="text-sm font-semibold text-stone-300">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-stone-300 block">Líquido Consolidado</span>
            <span className="text-base font-black text-emerald-400">{formatCurrency(totalNet)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
