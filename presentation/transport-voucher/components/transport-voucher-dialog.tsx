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
import { Loader2, Plus, Trash2, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const modalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome do modal obrigatório"),
  unitValue: z.coerce.number().min(0, "Valor não pode ser negativo"),
  quantity: z.coerce.number().min(1, "Quantidade mínima é 1"),
  subtotal: z.coerce.number().min(0),
});

const transportVoucherSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione um colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  inboundValue: z.coerce.number().min(0),
  outboundValue: z.coerce.number().min(0),
  weekendHolidayValue: z.coerce.number().optional().nullable(),
  workingDays: z.coerce.number().min(0),
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
      weekendHolidayValue: 0,
      workingDays: 22,
      weekendHolidayDays: 0,
      nightJokerIndicator: false,
      totalVouchers: 44,
      totalValue: 211.2,
      discountPercentage: 6.0,
      observations: "",
      modals: [
        {
          name: "Ônibus Urbano (Ida)",
          unitValue: 4.8,
          quantity: 22,
          subtotal: 105.6,
        },
        {
          name: "Ônibus Urbano (Volta)",
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

  const watchedModals = watch("modals");

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

  // Preenche dados ao editar
  React.useEffect(() => {
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      reset({
        id: voucherToEdit.id,
        employeeId: voucherToEdit.employeeId,
        referenceMonth: refDateStr,
        inboundValue: voucherToEdit.inboundValue,
        outboundValue: voucherToEdit.outboundValue,
        weekendHolidayValue: voucherToEdit.weekendHolidayValue || 0,
        workingDays: voucherToEdit.workingDays,
        weekendHolidayDays: voucherToEdit.weekendHolidayDays || 0,
        nightJokerIndicator: voucherToEdit.nightJokerIndicator || false,
        totalVouchers: voucherToEdit.totalVouchers,
        totalValue: voucherToEdit.totalValue,
        discountPercentage: voucherToEdit.discountPercentage || 0,
        observations: voucherToEdit.observations || "",
        modals: voucherToEdit.modals.map((m: any) => ({
          id: m.id,
          name: m.name,
          unitValue: m.unitValue,
          quantity: m.quantity,
          subtotal: m.subtotal,
        })),
      });
    } else {
      reset({
        employeeId: "",
        referenceMonth: defaultRefDate,
        inboundValue: 4.8,
        outboundValue: 4.8,
        weekendHolidayValue: 0,
        workingDays: 22,
        weekendHolidayDays: 0,
        nightJokerIndicator: false,
        totalVouchers: 44,
        totalValue: 211.2,
        discountPercentage: 6.0,
        observations: "",
        modals: [
          {
            name: "Ônibus Urbano (Ida)",
            unitValue: 4.8,
            quantity: 22,
            subtotal: 105.6,
          },
          {
            name: "Ônibus Urbano (Volta)",
            unitValue: 4.8,
            quantity: 22,
            subtotal: 105.6,
          },
        ],
      });
    }
  }, [voucherToEdit, reset, defaultRefDate, isOpen]);

  // Função para recalcular totais com base nos modais
  const handleRecalculateTotals = React.useCallback(() => {
    let totalQty = 0;
    let sumValue = 0;

    (watchedModals || []).forEach((m, idx) => {
      const sub = Number(m.unitValue || 0) * Number(m.quantity || 0);
      setValue(`modals.${idx}.subtotal`, Number(sub.toFixed(2)));
      totalQty += Number(m.quantity || 0);
      sumValue += sub;
    });

    setValue("totalVouchers", totalQty);
    setValue("totalValue", Number(sumValue.toFixed(2)));
  }, [watchedModals, setValue]);

  const onSubmit = async (data: TransportVoucherFormData) => {
    setIsLoading(true);
    try {
      const payload: TransportVoucherInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        inboundValue: Number(data.inboundValue),
        outboundValue: Number(data.outboundValue),
        weekendHolidayValue: data.weekendHolidayValue ? Number(data.weekendHolidayValue) : null,
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
        toast.success(data.id ? "Vale Transporte atualizado!" : "Vale Transporte cadastrado!");
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
      <DialogContent className="sm:max-w-2xl bg-stone-900 border-stone-800 text-stone-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-100">
            {voucherToEdit ? "Editar Lançamento de Vale Transporte" : "Novo Lançamento de Vale Transporte"}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Configure as tarifas, modais e dias úteis para emissão do recibo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Linha 1: Colaborador e Mês de Referência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-stone-300">Colaborador *</Label>
              <Select
                value={watch("employeeId")}
                onValueChange={(val) => setValue("employeeId", val)}
              >
                <SelectTrigger className="bg-stone-950/60 border-stone-800 text-stone-100">
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
              <Label className="text-stone-300">Data de Referência (Mês/Ano) *</Label>
              <Input
                type="date"
                {...register("referenceMonth")}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
              {errors.referenceMonth && (
                <p className="text-xs text-red-400">{errors.referenceMonth.message}</p>
              )}
            </div>
          </div>

          {/* Linha 2: Dias Úteis e Tarifas Base */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/40 p-3 rounded-lg border border-stone-800/80">
            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Dias Úteis</Label>
              <Input
                type="number"
                {...register("workingDays")}
                className="bg-stone-900 border-stone-800 text-stone-100 h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Tarifa Ida (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("inboundValue")}
                className="bg-stone-900 border-stone-800 text-stone-100 h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Tarifa Volta (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("outboundValue")}
                className="bg-stone-900 border-stone-800 text-stone-100 h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Desconto Leg. (%)</Label>
              <Input
                type="number"
                step="0.1"
                {...register("discountPercentage")}
                className="bg-stone-900 border-stone-800 text-stone-100 h-8 text-sm"
              />
            </div>
          </div>

          {/* Modais de Transporte Dinâmicos (Field Array) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-amber-400">
                Modais de Transporte (Itens do Recibo)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRecalculateTotals}
                  className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Calculator className="mr-1 h-3.5 w-3.5" />
                  Recalcular Totais
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      name: "Modal Adicional",
                      unitValue: 4.8,
                      quantity: 10,
                      subtotal: 48.0,
                    })
                  }
                  className="h-7 text-xs border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Adicionar Modal
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-center bg-stone-950/60 p-2.5 rounded-md border border-stone-800/60 text-xs"
                >
                  <div className="col-span-5 space-y-1">
                    <Input
                      placeholder="Nome do Modal (ex: Ônibus, Van)"
                      {...register(`modals.${index}.name`)}
                      className="bg-stone-900 border-stone-800 text-stone-100 h-7 text-xs"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor Unit."
                      {...register(`modals.${index}.unitValue`, {
                        onChange: (e) => {
                          const unit = parseFloat(e.target.value) || 0;
                          const qty = watchedModals[index]?.quantity || 0;
                          setValue(`modals.${index}.subtotal`, Number((unit * qty).toFixed(2)));
                        },
                      })}
                      className="bg-stone-900 border-stone-800 text-stone-100 h-7 text-xs"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      {...register(`modals.${index}.quantity`, {
                        onChange: (e) => {
                          const qty = parseInt(e.target.value, 10) || 0;
                          const unit = watchedModals[index]?.unitValue || 0;
                          setValue(`modals.${index}.subtotal`, Number((unit * qty).toFixed(2)));
                        },
                      })}
                      className="bg-stone-900 border-stone-800 text-stone-100 h-7 text-xs"
                    />
                  </div>

                  <div className="col-span-2 text-right font-medium text-stone-300">
                    {formatCurrency(
                      (watchedModals[index]?.unitValue || 0) *
                        (watchedModals[index]?.quantity || 0)
                    )}
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
          </div>

          {/* Totais Gerais */}
          <div className="grid grid-cols-2 gap-4 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <div className="space-y-1">
              <Label className="text-xs text-amber-300 font-semibold">Total de Vales (Qtd)</Label>
              <Input
                type="number"
                {...register("totalVouchers")}
                className="bg-stone-950 border-amber-500/30 text-stone-100 font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-amber-300 font-semibold">Valor Total Geral (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("totalValue")}
                className="bg-stone-950 border-amber-500/30 text-amber-400 font-bold"
              />
            </div>
          </div>

          {/* Opções extras */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nightJoker"
                checked={watch("nightJokerIndicator")}
                onCheckedChange={(c) => setValue("nightJokerIndicator", Boolean(c))}
              />
              <Label htmlFor="nightJoker" className="text-xs text-stone-300 cursor-pointer">
                Indicador de Coringa Noturno / Plantão Noturno
              </Label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-stone-400">Observações no Recibo</Label>
              <Textarea
                placeholder="Ex: Pagamento referente a deslocamentos especiais..."
                {...register("observations")}
                className="bg-stone-950/60 border-stone-800 text-stone-100 text-xs min-h-[50px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-stone-700 hover:bg-stone-800 text-stone-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
