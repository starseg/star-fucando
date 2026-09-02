"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertTransportVoucher,
  TransportVoucherInput,
  TransportModalInput,
} from "@/application/transport-voucher/transport-voucher-actions";
import { getEmployees } from "@/application/employee/employee-actions";
import { TransportVoucherData } from "./transport-voucher-table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Bus, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ModalItem {
  id?: string;
  name: string;
  unitValue: number | string;
  quantity: number | string;
  subtotal: number;
}

interface TransportVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: TransportVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function TransportVoucherDialog({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
  defaultMonth,
  defaultYear,
}: TransportVoucherDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  // Estados dos campos do formulário
  const [employeeId, setEmployeeId] = React.useState("");
  const [referenceMonth, setReferenceMonth] = React.useState("");
  const [workingDays, setWorkingDays] = React.useState<number | string>(22);
  const [discountPercentage, setDiscountPercentage] = React.useState<number | string>(6.0);
  const [observations, setObservations] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Lista dinâmica de modais com estado reativo puro
  const [modals, setModals] = React.useState<ModalItem[]>([
    { name: "Ônibus Ida", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
    { name: "Ônibus Volta", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
  ]);

  const defaultRefDate = React.useMemo(() => {
    const year = defaultYear || new Date().getFullYear();
    const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, [defaultMonth, defaultYear]);

  // Carrega lista de colaboradores
  React.useEffect(() => {
    async function loadEmployees() {
      const res = await getEmployees();
      if (res.success && res.data) {
        setEmployees(res.data.map((e) => ({ id: e.id, name: e.name })));
      }
    }
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  // Preenche dados ao abrir para editar ou criar novo
  React.useEffect(() => {
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      setEmployeeId(voucherToEdit.employeeId);
      setReferenceMonth(refDateStr);
      setWorkingDays(Number(voucherToEdit.workingDays) || 22);
      setDiscountPercentage(
        voucherToEdit.discountPercentage !== null && voucherToEdit.discountPercentage !== undefined
          ? Number(voucherToEdit.discountPercentage)
          : 6.0
      );
      setObservations(voucherToEdit.observations || "");

      const incoming = voucherToEdit.modals || [];
      if (incoming.length > 0) {
        setModals(
          incoming.map((m) => {
            const q = Number(m.quantity) || 0;
            const u = Number(m.unitValue) || 0;
            return {
              id: m.id,
              name: m.name,
              unitValue: u,
              quantity: q,
              subtotal: Number((q * u).toFixed(2)),
            };
          })
        );
      } else {
        const wDays = Number(voucherToEdit.workingDays) || 22;
        const inVal = Number(voucherToEdit.inboundValue) || 4.8;
        const outVal = Number(voucherToEdit.outboundValue) || 4.8;
        setModals([
          { name: "Ônibus Ida", unitValue: inVal, quantity: wDays, subtotal: Number((wDays * inVal).toFixed(2)) },
          { name: "Ônibus Volta", unitValue: outVal, quantity: wDays, subtotal: Number((wDays * outVal).toFixed(2)) },
        ]);
      }
    } else {
      setEmployeeId("");
      setReferenceMonth(defaultRefDate);
      setWorkingDays(22);
      setDiscountPercentage(6.0);
      setObservations("");
      setModals([
        { name: "Ônibus Ida", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
        { name: "Ônibus Volta", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
      ]);
    }
    setFormError(null);
  }, [voucherToEdit, defaultRefDate, isOpen]);

  // Atualiza um campo específico de um modal e recalcula o subtotal
  const handleUpdateModal = (index: number, field: "name" | "unitValue" | "quantity", value: string | number) => {
    setModals((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      const q = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity), 10) || 0;
      const u = typeof item.unitValue === "number" ? item.unitValue : parseFloat(String(item.unitValue).replace(",", ".")) || 0;
      item.subtotal = Number((q * u).toFixed(2));
      next[index] = item;
      return next;
    });
  };

  // Adiciona um transporte extra à lista
  const handleAddExtraModal = () => {
    const numericDays = typeof workingDays === "number" ? workingDays : parseInt(String(workingDays), 10) || 10;
    setModals((prev) => [
      ...prev,
      {
        name: "Transporte Adicional",
        unitValue: 5.0,
        quantity: numericDays,
        subtotal: Number((numericDays * 5.0).toFixed(2)),
      },
    ]);
  };

  // Remove um modal da lista com recálculo instantâneo
  const handleRemoveModal = (index: number) => {
    setModals((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Sincroniza dias úteis com os modais de ida e volta padrão
  const handleWorkingDaysChange = (daysVal: string) => {
    setWorkingDays(daysVal);
    const parsedDays = parseInt(daysVal, 10) || 0;
    setModals((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((m, idx) => {
        if (idx === 0 || idx === 1) {
          const u = typeof m.unitValue === "number" ? m.unitValue : parseFloat(String(m.unitValue).replace(",", ".")) || 0;
          return {
            ...m,
            quantity: daysVal === "" ? "" : parsedDays,
            subtotal: Number((parsedDays * u).toFixed(2)),
          };
        }
        return m;
      });
    });
  };

  // Cálculos matemáticos derivados reativos sem risco de concatenação de strings
  const totalVouchers = React.useMemo(() => {
    return modals.reduce((sum, m) => {
      const q = typeof m.quantity === "number" ? m.quantity : parseInt(String(m.quantity), 10) || 0;
      return sum + q;
    }, 0);
  }, [modals]);

  const totalValue = React.useMemo(() => {
    const sum = modals.reduce((acc, m) => {
      const q = typeof m.quantity === "number" ? m.quantity : parseInt(String(m.quantity), 10) || 0;
      const u = typeof m.unitValue === "number" ? m.unitValue : parseFloat(String(m.unitValue).replace(",", ".")) || 0;
      return acc + (q * u);
    }, 0);
    return Number(sum.toFixed(2));
  }, [modals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setFormError("Selecione o colaborador.");
      return;
    }
    if (!referenceMonth) {
      setFormError("Selecione o mês de referência.");
      return;
    }
    if (modals.length === 0) {
      setFormError("Adicione pelo menos um modal de transporte.");
      return;
    }

    setIsLoading(true);
    setFormError(null);
    try {
      const sanitizedModals: TransportModalInput[] = modals.map((m, idx) => {
        const q = typeof m.quantity === "number" ? m.quantity : parseInt(String(m.quantity), 10) || 0;
        const u = typeof m.unitValue === "number" ? m.unitValue : parseFloat(String(m.unitValue).replace(",", ".")) || 0;
        const defaultName = idx === 0 ? "Ônibus Ida" : idx === 1 ? "Ônibus Volta" : `Transporte ${idx + 1}`;
        const name = (m.name || "").trim() || defaultName;

        return {
          id: m.id,
          name,
          unitValue: u,
          quantity: q,
          subtotal: Number((q * u).toFixed(2)),
        };
      });

      const finalTotalVouchers = sanitizedModals.reduce((sum, m) => sum + m.quantity, 0);
      const finalTotalValue = Number(
        sanitizedModals.reduce((sum, m) => sum + m.subtotal, 0).toFixed(2)
      );

      const m0Unit = sanitizedModals[0] ? sanitizedModals[0].unitValue : 0;
      const m1Unit = sanitizedModals[1] ? sanitizedModals[1].unitValue : 0;

      const parsedDiscount =
        discountPercentage !== undefined &&
        discountPercentage !== null &&
        String(discountPercentage).trim() !== ""
          ? Number(discountPercentage)
          : null;

      const payload: TransportVoucherInput = {
        id: voucherToEdit?.id,
        employeeId,
        referenceMonth,
        inboundValue: m0Unit,
        outboundValue: m1Unit,
        workingDays: typeof workingDays === "number" ? workingDays : parseInt(String(workingDays), 10) || 0,
        weekendHolidayDays: 0,
        weekendHolidayValue: null,
        nightJokerIndicator: false,
        totalVouchers: finalTotalVouchers,
        totalValue: finalTotalValue,
        discountPercentage: parsedDiscount,
        observations: observations?.trim() || null,
        modals: sanitizedModals,
      };

      const res = await upsertTransportVoucher(payload);
      if (res.success) {
        toast.success(
          voucherToEdit?.id ? "Vale Transporte atualizado!" : "Vale Transporte cadastrado com sucesso!"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Falha ao salvar Vale Transporte.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao salvar lançamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-100">
                {voucherToEdit ? "Editar Vale Transporte" : "Novo Lançamento de Vale Transporte"}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400">
                Configure os modais e quantidades de passagens para emissão do recibo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {formError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {formError}
            </div>
          )}

          {/* Seção 1: Colaborador e Mês de Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
              <Select
                value={employeeId}
                onValueChange={(val) => {
                  setEmployeeId(val);
                  if (formError) setFormError(null);
                }}
              >
                <SelectTrigger className="bg-stone-900 border-stone-700/70 text-stone-100 h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
              <Input
                type="date"
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
                className="bg-stone-900 border-stone-700/70 text-stone-100 h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Seção 2: Modais de Transporte e Quantidades */}
          <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Modais de Transporte & Quantidades
              </span>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-stone-400">Dias Úteis Padrão:</Label>
                <Input
                  type="number"
                  min="0"
                  value={workingDays}
                  onChange={(e) => handleWorkingDaysChange(e.target.value)}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-7 w-16 text-center text-xs font-bold rounded-lg"
                />
              </div>
            </div>

            {/* Lista dos Modais */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {modals.map((modal, index) => {
                const isStandard = index === 0 || index === 1;

                return (
                  <div
                    key={modal.id || `modal-${index}`}
                    className="grid grid-cols-12 gap-2 items-center bg-stone-950/80 border border-stone-800/80 p-2.5 rounded-xl text-xs"
                  >
                    {/* Nome do Modal */}
                    <div className="col-span-4 space-y-0.5">
                      <Label className="text-[10px] text-stone-400 font-medium">Transporte / Modal</Label>
                      <Input
                        placeholder="Ex: Ônibus, Van..."
                        value={modal.name}
                        onChange={(e) => handleUpdateModal(index, "name", e.target.value)}
                        className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg font-medium"
                      />
                    </div>

                    {/* Tarifa Unitária */}
                    <div className="col-span-3 space-y-0.5">
                      <Label className="text-[10px] text-stone-400 font-medium">Tarifa Unit. (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={modal.unitValue}
                        onChange={(e) => handleUpdateModal(index, "unitValue", e.target.value)}
                        className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg text-right font-semibold"
                      />
                    </div>

                    {/* Quantidade de Passagens */}
                    <div className="col-span-2 space-y-0.5">
                      <Label className="text-[10px] text-stone-400 font-medium">Qtd Vales</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={modal.quantity}
                        onChange={(e) => handleUpdateModal(index, "quantity", e.target.value)}
                        className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg text-center font-bold text-amber-300"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 space-y-0.5 text-right">
                      <Label className="text-[10px] text-stone-400 font-medium">Subtotal</Label>
                      <div className="h-7 flex items-center justify-end font-bold text-stone-100 text-xs">
                        {formatCurrency(modal.subtotal)}
                      </div>
                    </div>

                    {/* Ação (Remover se extra) */}
                    <div className="col-span-1 text-right flex justify-end items-end pt-3">
                      {!isStandard ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remover transporte"
                          onClick={() => handleRemoveModal(index)}
                          className="h-6 w-6 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover este transporte"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <div className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão para adicionar transporte extra */}
            <div className="pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddExtraModal}
                className="h-7 text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Adicionar Transporte Extra (Van, Metrô, Integração...)
              </Button>
            </div>
          </div>

          {/* Destaque do Total */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total de Passagens
              </span>
              <span className="text-xl font-bold text-stone-100">
                {totalVouchers} vales
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block">
                Valor Total do Recibo
              </span>
              <span className="text-2xl font-black text-amber-400">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          {/* Desconto em Folha e Observação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Desconto em Folha (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 6.0"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Observações (opcional)</Label>
              <Input
                placeholder="Ex: Escala 12x36..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-stone-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-stone-400 hover:text-stone-100 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold px-5 rounded-xl shadow-md shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : voucherToEdit ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar Lançamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
