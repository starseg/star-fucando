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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Printer, Bus } from "lucide-react";
import { deleteTransportVoucher } from "@/application/transport-voucher/transport-voucher-actions";
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
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (allSelected: boolean) => void;
  onEdit: (voucher: TransportVoucherData) => void;
  onRefresh: () => void;
  onPrint: (ids: string[]) => void;
  onCopyPreviousMonth?: () => void;
}

export function TransportVoucherTable({
  vouchers,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onRefresh,
  onPrint,
  onCopyPreviousMonth,
}: TransportVoucherTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  // TODO: migrar para o componente AlertDialog do shadcn/ui quando o MCP do shadcn voltar a funcionar.
  const [voucherToDelete, setVoucherToDelete] = React.useState<TransportVoucherData | null>(null);

  const allSelected = vouchers.length > 0 && selectedIds.length === vouchers.length;

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;
    const id = voucherToDelete.id;

    setDeletingId(id);
    try {
      const res = await deleteTransportVoucher(id);
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
      setVoucherToDelete(null);
    }
  };

  if (vouchers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <Bus className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-stone-200">Nenhum lançamento encontrado</h3>
        <p className="mt-1 text-xs text-stone-400 max-w-sm">
          Você pode cadastrar um novo lançamento ou copiar os dados do mês anterior com 1 clique.
        </p>
        {onCopyPreviousMonth && (
          <Button
            onClick={onCopyPreviousMonth}
            className="mt-4 bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 rounded-xl h-9 px-4 text-xs"
          >
            Copiar Lançamentos do Mês Anterior
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
              Dias Úteis / Trajeto
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-center">
              Qtd. Vales
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right">
              Valor Total
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
                  isSelected ? "bg-amber-500/10 hover:bg-amber-500/15" : "hover:bg-stone-800/30"
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 text-xs font-black border border-amber-500/20">
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
                      {voucher.workingDays} dias úteis
                    </span>
                    <span className="text-xs text-stone-300">
                      {voucher.modals.length === 2 &&
                      voucher.modals.some((m) => /ida/i.test(m.name)) &&
                      voucher.modals.some((m) => /volta/i.test(m.name))
                        ? `Ida (${formatCurrency(voucher.inboundValue)}) + Volta (${formatCurrency(voucher.outboundValue)})`
                        : voucher.modals.map((m) => m.name).join(", ")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-stone-200 text-sm">
                  {voucher.totalVouchers} un.
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-base font-black text-amber-400 block">
                    {formatCurrency(voucher.totalValue)}
                  </span>
                  {voucher.discountPercentage != null && (
                    <span className="text-[10px] text-stone-300">
                      Desc. {voucher.discountPercentage}%
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrint([voucher.id])}
                      className="h-8 px-2.5 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg"
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
                      onClick={() => setVoucherToDelete(voucher)}
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

      {/* Confirmação de exclusão (fallback com Dialog; migrar para AlertDialog do shadcn/ui quando o MCP voltar a funcionar) */}
      <Dialog
        open={!!voucherToDelete}
        onOpenChange={(open) => !open && !deletingId && setVoucherToDelete(null)}
      >
        <DialogContent className="sm:max-w-sm bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-100">
              Excluir lançamento
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Excluir o lançamento de Vale Transporte de &quot;{voucherToDelete?.employee.name}
              &quot;? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3 border-t border-stone-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setVoucherToDelete(null)}
              disabled={!!deletingId}
              className="text-stone-400 hover:text-stone-100 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={!!deletingId}
              className="font-bold px-5 rounded-xl shadow-md bg-red-500 text-stone-950 hover:bg-red-400 shadow-red-500/20"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
