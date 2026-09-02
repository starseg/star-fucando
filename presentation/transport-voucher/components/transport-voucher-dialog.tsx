"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, Plus, Trash2, Bus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const modalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Informe a identificação").default("Transporte Extra"),
  unitValue: z.coerce.number().min(0, "Valor unitário não pode ser negativo"),
  quantity: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  subtotal: z.coerce.number().min(0).optional(),
});

const transportVoucherSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione o colaborador"),
  referenceMonth: z.string().min(1, "Mês obrigatório"),
  inboundValue: z.coerce.number().min(0, "Tarifa de ida não pode ser negativa"),
  outboundValue: z.coerce.number().min(0, "Tarifa de volta não pode ser negativa"),
  weekendHolidayValue: z.coerce.number().optional().nullable(),
  workingDays: z.coerce.number().min(1, "Informe os dias úteis"),
  weekendHolidayDays: z.coerce.number().min(0).optional(),
  nightJokerIndicator: z.boolean().default(false),
  totalVouchers: z.coerce.number().min(0),
  totalValue: z.coerce.number().min(0),
  discountPercentage: z.coerce.number().optional().nullable(),
  observations: z.string().optional().nullable(),
  modals: z.array(modalSchema),
});

type TransportVoucherFormData = z.infer<typeof transportVoucherSchema>;

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
  const [showAdvancedModals, setShowAdvancedModals] = React.useState(false);

  const defaultRefDate = React.useMemo(() => {
    const year = defaultYear || new Date().getFullYear();
    const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, [defaultMonth, defaultYear]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransportVoucherFormData>({
    resolver: zodResolver(transportVoucherSchema as any),
    defaultValues: {
      employeeId: "",
      referenceMonth: defaultRefDate,
      inboundValue: 4.8,
      outboundValue: 4.8,
      workingDays: 22,
      totalVouchers: 44,
      totalValue: 211.2,
      discountPercentage: 6.0,
      nightJokerIndicator: false,
      observations: "",
      modals: [
        {
          name: "Ônibus Ida",
          unitValue: 4.8,
          quantity: 22,
          subtotal: 105.6,
        },
        {
          name: "Ônibus Volta",
          unitValue: 4.8,
          quantity: 22,
          subtotal: 105.6,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modals",
  });

  const watchedWorkingDays = watch("workingDays");
  const watchedInbound = watch("inboundValue");
  const watchedOutbound = watch("outboundValue");
  const watchedModals = watch("modals") || [];

  // Recalculo 100% derivado e imune a race conditions e concatenações de string
  const numericDays = Number(watchedWorkingDays) || 0;
  const numericInbound = Number(watchedInbound) || 0;
  const numericOutbound = Number(watchedOutbound) || 0;
  const dailyTotal = Number((numericInbound + numericOutbound).toFixed(2));

  // Trajeto padrão (Ônibus Ida e Volta)
  const standardInSubtotal = Number((numericDays * numericInbound).toFixed(2));
  const standardOutSubtotal = Number((numericDays * numericOutbound).toFixed(2));
  const standardVouchersCount = numericDays * 2;
  const standardTotalValue = Number((standardInSubtotal + standardOutSubtotal).toFixed(2));

  // Modais extras (índices 2 em diante)
  const extraModalsList = watchedModals.slice(2);
  const extraVouchersCount = extraModalsList.reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0;
    return sum + qty;
  }, 0);

  const extraTotalValue = extraModalsList.reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0;
    const unit = Number(item?.unitValue) || 0;
    return sum + Number((qty * unit).toFixed(2));
  }, 0);

  const calculatedTotalVouchers = standardVouchersCount + extraVouchersCount;
  const calculatedTotalValue = Number((standardTotalValue + extraTotalValue).toFixed(2));

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

  // Preenche dados ao abrir para editar ou novo lançamento
  React.useEffect(() => {
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      const incomingModals = voucherToEdit.modals || [];
      const hasExtras = incomingModals.length > 2;
      setShowAdvancedModals(hasExtras);

      const m0 = incomingModals[0] || {
        name: "Ônibus Ida",
        unitValue: voucherToEdit.inboundValue,
        quantity: voucherToEdit.workingDays,
        subtotal: Number((voucherToEdit.inboundValue * voucherToEdit.workingDays).toFixed(2)),
      };
      const m1 = incomingModals[1] || {
        name: "Ônibus Volta",
        unitValue: voucherToEdit.outboundValue,
        quantity: voucherToEdit.workingDays,
        subtotal: Number((voucherToEdit.outboundValue * voucherToEdit.workingDays).toFixed(2)),
      };
      const extraItems = incomingModals.slice(2).map((m) => ({
        id: m.id,
        name: m.name,
        unitValue: m.unitValue,
        quantity: m.quantity,
        subtotal: m.subtotal,
      }));

      reset({
        id: voucherToEdit.id,
        employeeId: voucherToEdit.employeeId,
        referenceMonth: refDateStr,
        inboundValue: voucherToEdit.inboundValue,
        outboundValue: voucherToEdit.outboundValue,
        workingDays: voucherToEdit.workingDays,
        weekendHolidayDays: voucherToEdit.weekendHolidayDays || 0,
        weekendHolidayValue: voucherToEdit.weekendHolidayValue || null,
        nightJokerIndicator: voucherToEdit.nightJokerIndicator || false,
        totalVouchers: voucherToEdit.totalVouchers,
        totalValue: voucherToEdit.totalValue,
        discountPercentage: voucherToEdit.discountPercentage ?? 6.0,
        observations: voucherToEdit.observations || "",
        modals: [
          {
            id: m0.id,
            name: m0.name || "Ônibus Ida",
            unitValue: m0.unitValue,
            quantity: m0.quantity,
            subtotal: m0.subtotal,
          },
          {
            id: m1.id,
            name: m1.name || "Ônibus Volta",
            unitValue: m1.unitValue,
            quantity: m1.quantity,
            subtotal: m1.subtotal,
          },
          ...extraItems,
        ],
      });
    } else {
      setShowAdvancedModals(false);
      reset({
        employeeId: "",
        referenceMonth: defaultRefDate,
        inboundValue: 4.8,
        outboundValue: 4.8,
        workingDays: 22,
        totalVouchers: 44,
        totalValue: 211.2,
        discountPercentage: 6.0,
        nightJokerIndicator: false,
        observations: "",
        modals: [
          { name: "Ônibus Ida", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
          { name: "Ônibus Volta", unitValue: 4.8, quantity: 22, subtotal: 105.6 },
        ],
      });
    }
  }, [voucherToEdit, reset, defaultRefDate, isOpen]);

  const onSubmit = async (data: TransportVoucherFormData) => {
    setIsLoading(true);
    try {
      const days = Number(data.workingDays) || 0;
      const inVal = Number(data.inboundValue) || 0;
      const outVal = Number(data.outboundValue) || 0;
      const inSub = Number((days * inVal).toFixed(2));
      const outSub = Number((days * outVal).toFixed(2));

      const standardModals: TransportModalInput[] = [
        {
          id: data.modals?.[0]?.id,
          name: "Ônibus Ida",
          unitValue: inVal,
          quantity: days,
          subtotal: inSub,
        },
        {
          id: data.modals?.[1]?.id,
          name: "Ônibus Volta",
          unitValue: outVal,
          quantity: days,
          subtotal: outSub,
        },
      ];

      const extraItems: TransportModalInput[] = (data.modals || []).slice(2).map((m) => {
        const qty = Number(m.quantity) || 0;
        const unit = Number(m.unitValue) || 0;
        return {
          id: m.id,
          name: (m.name || "").trim() || "Item Extra",
          unitValue: unit,
          quantity: qty,
          subtotal: Number((qty * unit).toFixed(2)),
        };
      });

      const allModals = [...standardModals, ...extraItems];
      const finalTotalVouchers = allModals.reduce((sum, m) => sum + m.quantity, 0);
      const finalTotalValue = Number(
        allModals.reduce((sum, m) => sum + m.subtotal, 0).toFixed(2)
      );

      const parsedDiscount =
        data.discountPercentage !== undefined &&
        data.discountPercentage !== null &&
        (data.discountPercentage as unknown as string) !== ""
          ? Number(data.discountPercentage)
          : null;

      const payload: TransportVoucherInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        inboundValue: inVal,
        outboundValue: outVal,
        workingDays: days,
        weekendHolidayDays: Number(data.weekendHolidayDays || 0),
        weekendHolidayValue: data.weekendHolidayValue ? Number(data.weekendHolidayValue) : null,
        nightJokerIndicator: Boolean(data.nightJokerIndicator),
        totalVouchers: finalTotalVouchers,
        totalValue: finalTotalValue,
        discountPercentage: parsedDiscount,
        observations: data.observations || null,
        modals: allModals,
      };

      const res = await upsertTransportVoucher(payload);
      if (res.success) {
        toast.success(
          data.id ? "Vale Transporte atualizado!" : "Vale Transporte cadastrado com sucesso!"
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
      <DialogContent className="sm:max-w-xl bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
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
                Informe o colaborador e os dias para cálculo automático do recibo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Seção 1: Quem e Quando */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
              <Select
                value={watch("employeeId")}
                onValueChange={(val) => setValue("employeeId", val, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl">
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
              {errors.employeeId && (
                <p className="text-xs text-red-400">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
              <Input
                type="date"
                {...register("referenceMonth")}
                className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Seção 2: Dias Úteis e Trajeto Padrão (Ônibus Ida / Volta) */}
          <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Cálculo Automático de Passagens (Ida / Volta)
              </span>
              <span className="text-xs text-stone-400">
                Gasto diário: <strong className="text-stone-200">{formatCurrency(dailyTotal)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Dias Úteis</Label>
                <Input
                  type="number"
                  min="0"
                  {...register("workingDays")}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Tarifa Ida (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("inboundValue")}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Tarifa Volta (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("outboundValue")}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Transporte Adicional / Modais Extras */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-expanded={showAdvancedModals}
                aria-controls="extra-modals-list"
                onClick={() => setShowAdvancedModals(!showAdvancedModals)}
                className="text-xs font-semibold text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                {showAdvancedModals ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
                    Ocultar transportes adicionais ({fields.length > 2 ? `${fields.length - 2} item(ns)` : "0"})
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 text-amber-400" />
                    Adicionar transporte extra (Van, Integração, Uber...) {fields.length > 2 ? `(${fields.length - 2})` : ""}
                  </>
                )}
              </button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAdvancedModals(true);
                  append({
                    name: "Van Complementar",
                    unitValue: 10.0,
                    quantity: 10,
                    subtotal: 100.0,
                  });
                }}
                className="h-7 text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Novo Item Extra
              </Button>
            </div>

            {showAdvancedModals && (
              <div
                id="extra-modals-list"
                className="space-y-2 max-h-48 overflow-y-auto p-2.5 bg-stone-950/60 rounded-xl border border-stone-800/80"
              >
                {fields.length <= 2 ? (
                  <p className="text-xs text-stone-400 text-center py-3">
                    Nenhum transporte extra adicionado. Clique no botão acima para incluir Van, Integração ou Uber.
                  </p>
                ) : (
                  fields.slice(2).map((field, extraIdx) => {
                    const realIndex = extraIdx + 2;
                    const currentModal = watchedModals[realIndex];
                    const itemQty = Number(currentModal?.quantity) || 0;
                    const itemUnit = Number(currentModal?.unitValue) || 0;
                    const itemSubtotal = Number((itemQty * itemUnit).toFixed(2));
                    const fieldError = errors.modals?.[realIndex];

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-2 items-center text-xs bg-stone-900/90 border border-stone-800/80 p-2 rounded-xl"
                      >
                        <div className="col-span-4 space-y-0.5">
                          <Label className="text-[10px] text-stone-400 font-medium">Nome / Tipo</Label>
                          <Input
                            placeholder="Ex: Van, Metrô..."
                            {...register(`modals.${realIndex}.name`)}
                            className="bg-stone-950 border-stone-800 text-stone-100 h-8 text-xs rounded-lg"
                          />
                          {fieldError?.name && (
                            <p className="text-[10px] text-red-400 leading-tight">
                              {fieldError.name.message}
                            </p>
                          )}
                        </div>
                        <div className="col-span-3 space-y-0.5">
                          <Label className="text-[10px] text-stone-400 font-medium">Tarifa Unit. (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            {...register(`modals.${realIndex}.unitValue`)}
                            className="bg-stone-950 border-stone-800 text-stone-100 h-8 text-xs rounded-lg text-right"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <Label className="text-[10px] text-stone-400 font-medium">Qtd</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register(`modals.${realIndex}.quantity`)}
                            className="bg-stone-950 border-stone-800 text-stone-100 h-8 text-xs rounded-lg text-center"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5 text-right">
                          <Label className="text-[10px] text-stone-400 font-medium">Subtotal</Label>
                          <div className="h-8 flex items-center justify-end font-bold text-amber-400 text-xs">
                            {formatCurrency(itemSubtotal)}
                          </div>
                        </div>
                        <div className="col-span-1 pt-3.5 text-right flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remover transporte extra"
                            onClick={() => remove(realIndex)}
                            className="h-7 w-7 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remover transporte extra"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Destaque do Total */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total de Passagens
              </span>
              <span className="text-lg font-bold text-stone-100">
                {calculatedTotalVouchers} vales
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block">
                Valor Total do Recibo
              </span>
              <span className="text-2xl font-black text-amber-400">
                {formatCurrency(calculatedTotalValue)}
              </span>
            </div>
          </div>

          {/* Observação e Desconto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Desconto em Folha (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 6.0"
                {...register("discountPercentage")}
                className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Observações (opcional)</Label>
              <Input
                placeholder="Ex: Escala 12x36..."
                {...register("observations")}
                className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-stone-800">
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
