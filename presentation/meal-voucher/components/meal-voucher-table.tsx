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
import { formatCurrency } from "@/lib/utils";
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
    if (!confirm(`Excluir o Vale Alimentação de "${employeeName}"?`)) {
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <Utensils className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-stone-200">Nenhum lançamento encontrado</h3>
        <p className="mt-1 text-xs text-stone-400 max-w-sm">
          Clique no botão "Novo Lançamento" para cadastrar os vales alimentação deste mês.
        </p>
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
              Dias / Diária
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right">
              Total Bruto
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right">
              Valor Líquido
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right w-36">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((voucher) => {
            const isSelected = selectedIds.includes(voucher.id);
            return (
              <TableRow
                key={voucher.id}
                className={`border-b border-stone-800/60 transition-colors ${
                  isSelected ? "bg-emerald-500/10 hover:bg-emerald-500/15" : "hover:bg-stone-800/30"
                }`}
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(voucher.id)}
                    aria-label={`Selecionar ${voucher.employee.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-black border border-emerald-500/20">
                      {voucher.employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-stone-100 text-sm block">
                        {voucher.employee.name}
                      </span>
                      <span className="text-xs text-stone-300">
                        {voucher.employee.department || "Operacional"} • {voucher.employee.role || "Colaborador"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-stone-200 block">
                      {voucher.workedDays} dias úteis
                    </span>
                    <span className="text-xs text-stone-300">
                      Diária de {formatCurrency(voucher.unitValue)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-semibold text-stone-300 block">
                    {formatCurrency(voucher.totalValue)}
                  </span>
                  {voucher.discounts > 0 && (
                    <span className="text-[10px] text-red-400">
                      Desc. -{formatCurrency(voucher.discounts)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-base font-black text-emerald-400 block">
                    {formatCurrency(voucher.netValue)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrint([voucher.id])}
                      className="h-8 px-2.5 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                      title="Imprimir recibo individual"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Recibo
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(voucher)}
                      className="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(voucher.id, voucher.employee.name)}
                      disabled={deletingId === voucher.id}
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
