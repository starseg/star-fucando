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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertTransportVoucher, TransportVoucherInput } from "@/application/transport-voucher/transport-voucher-actions";
import { getEmployees } from "@/application/employee/employee-actions";
import { TransportVoucherData } from "./transport-voucher-table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Bus, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const modalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  unitValue: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1),
  subtotal: z.coerce.number().min(0),
});

const transportVoucherSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione o colaborador"),
  referenceMonth: z.string().min(1, "Mês obrigatório"),
  inboundValue: z.coerce.number().min(0),
  outboundValue: z.coerce.number().min(0),
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

  const watchedWorkingDays = watch("workingDays") || 0;
  const watchedInbound = watch("inboundValue") || 0;
  const watchedOutbound = watch("outboundValue") || 0;
  const watchedModals = watch("modals") || [];
  const watchedTotalValue = watch("totalValue") || 0;
  const watchedTotalVouchers = watch("totalVouchers") || 0;

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

  // Recálculo automático simples e limpo quando dias ou tarifas básicas mudam
  const syncStandardModals = React.useCallback(
    (days: number, inVal: number, outVal: number) => {
      const busInSub = Number((days * inVal).toFixed(2));
      const busOutSub = Number((days * outVal).toFixed(2));
      const totalBusQty = days * 2;
      const totalBusValue = Number((busInSub + busOutSub).toFixed(2));

      // Se temos apenas os 2 modais padrão (Ida e Volta)
      if (watchedModals.length <= 2) {
        setValue("modals", [
          { name: "Ônibus Ida", unitValue: inVal, quantity: days, subtotal: busInSub },
          { name: "Ônibus Volta", unitValue: outVal, quantity: days, subtotal: busOutSub },
        ]);
        setValue("totalVouchers", totalBusQty);
        setValue("totalValue", totalBusValue);
      } else {
        // Se houver modais extras adicionados, soma todos
        let totalQty = 0;
        let sum = 0;
        watchedModals.forEach((m, idx) => {
          const sub = Number((m.unitValue * m.quantity).toFixed(2));
          setValue(`modals.${idx}.subtotal`, sub);
          totalQty += m.quantity;
          sum += sub;
        });
        setValue("totalVouchers", totalQty);
        setValue("totalValue", Number(sum.toFixed(2)));
      }
    },
    [watchedModals, setValue]
  );

  // Preenche dados ao abrir para editar ou novo
  React.useEffect(() => {
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      setShowAdvancedModals(voucherToEdit.modals.length > 2);
      reset({
        id: voucherToEdit.id,
        employeeId: voucherToEdit.employeeId,
        referenceMonth: refDateStr,
        inboundValue: voucherToEdit.inboundValue,
        outboundValue: voucherToEdit.outboundValue,
        workingDays: voucherToEdit.workingDays,
        weekendHolidayDays: voucherToEdit.weekendHolidayDays || 0,
        nightJokerIndicator: voucherToEdit.nightJokerIndicator || false,
        totalVouchers: voucherToEdit.totalVouchers,
        totalValue: voucherToEdit.totalValue,
        discountPercentage: voucherToEdit.discountPercentage || 0,
        observations: voucherToEdit.observations || "",
        modals: voucherToEdit.modals.map((m) => ({
          id: m.id,
          name: m.name,
          unitValue: m.unitValue,
          quantity: m.quantity,
          subtotal: m.subtotal,
        })),
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
      const payload: TransportVoucherInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        inboundValue: Number(data.inboundValue),
        outboundValue: Number(data.outboundValue),
        workingDays: Number(data.workingDays),
        weekendHolidayDays: Number(data.weekendHolidayDays || 0),
        nightJokerIndicator: Boolean(data.nightJokerIndicator),
        totalVouchers: Number(data.totalVouchers),
        totalValue: Number(data.totalValue),
        discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
        observations: data.observations || null,
        modals: data.modals.map((m) => ({
          name: m.name,
          unitValue: Number(m.unitValue),
          quantity: Number(m.quantity),
          subtotal: Number(m.subtotal || m.unitValue * m.quantity),
        })),
      };

      const res = await upsertTransportVoucher(payload);
      if (res.success) {
        toast.success(data.id ? "Vale Transporte atualizado!" : "Vale Transporte cadastrado com sucesso!");
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

  const dailyTotal = Number(watchedInbound) + Number(watchedOutbound);

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
                onValueChange={(val) => setValue("employeeId", val)}
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

          {/* Seção 2: Dias e Tarifas Diretas */}
          <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Cálculo Automático de Passagens
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
                  {...register("workingDays", {
                    onChange: (e) => {
                      const days = parseInt(e.target.value, 10) || 0;
                      syncStandardModals(days, watchedInbound, watchedOutbound);
                    },
                  })}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Tarifa Ida (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("inboundValue", {
                    onChange: (e) => {
                      const inVal = parseFloat(e.target.value) || 0;
                      syncStandardModals(watchedWorkingDays, inVal, watchedOutbound);
                    },
                  })}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Tarifa Volta (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("outboundValue", {
                    onChange: (e) => {
                      const outVal = parseFloat(e.target.value) || 0;
                      syncStandardModals(watchedWorkingDays, watchedInbound, outVal);
                    },
                  })}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Transporte Adicional / Modais Extras (Opcional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedModals(!showAdvancedModals)}
                className="text-xs font-semibold text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                {showAdvancedModals ? "▲ Ocultar transportes adicionais" : "▼ Adicionar transporte extra (Van, Integração, Uber...)"}
              </button>

              {showAdvancedModals && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      name: "Van Complementar",
                      unitValue: 10.0,
                      quantity: 10,
                      subtotal: 100.0,
                    })
                  }
                  className="h-7 text-xs border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700 rounded-lg"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Novo Item Extra
                </Button>
              )}
            </div>

            {showAdvancedModals && (
              <div className="space-y-2 max-h-36 overflow-y-auto p-2 bg-stone-950/60 rounded-xl border border-stone-800/80">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 items-center text-xs bg-stone-900/80 p-2 rounded-lg"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Nome (ex: Van)"
                        {...register(`modals.${index}.name`)}
                        className="bg-stone-950 border-stone-800 text-stone-100 h-7 text-xs rounded"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor unit."
                        {...register(`modals.${index}.unitValue`, {
                          onChange: () => syncStandardModals(watchedWorkingDays, watchedInbound, watchedOutbound),
                        })}
                        className="bg-stone-950 border-stone-800 text-stone-100 h-7 text-xs rounded"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        {...register(`modals.${index}.quantity`, {
                          onChange: () => syncStandardModals(watchedWorkingDays, watchedInbound, watchedOutbound),
                        })}
                        className="bg-stone-950 border-stone-800 text-stone-100 h-7 text-xs rounded"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-6 w-6 text-stone-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                {watchedTotalVouchers} vales
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block">
                Valor Total do Recibo
              </span>
              <span className="text-2xl font-black text-amber-400">
                {formatCurrency(watchedTotalValue)}
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
