"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
import { upsertMealVoucher, MealVoucherInput } from "@/application/meal-voucher/meal-voucher-actions";
import { getEmployees } from "@/application/employee/employee-actions";
import { MealVoucherData } from "./meal-voucher-table";
import { toast } from "sonner";
import { Loader2, Utensils, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const mealVoucherSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione o colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  unitValue: z.coerce.number().min(0, "Valor unitário não pode ser negativo"),
  workedDays: z.coerce.number().min(0, "Informe os dias trabalhados"),
  voucherCount: z.coerce.number().min(0),
  totalValue: z.coerce.number().min(0),
  discounts: z.coerce.number().optional().nullable(),
});

type MealVoucherFormData = z.infer<typeof mealVoucherSchema>;

interface MealVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: MealVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function MealVoucherDialog({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
  defaultMonth,
  defaultYear,
}: MealVoucherDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  const defaultRefDate = React.useMemo(() => {
    const year = defaultYear || new Date().getFullYear();
    const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, [defaultMonth, defaultYear]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MealVoucherFormData>({
    resolver: zodResolver(mealVoucherSchema as any),
    defaultValues: {
      employeeId: "",
      referenceMonth: defaultRefDate,
      unitValue: 32.5,
      workedDays: 22,
      voucherCount: 22,
      totalValue: 715.0,
      discounts: 0,
    },
  });

  const watchedUnitValue = watch("unitValue") || 0;
  const watchedWorkedDays = watch("workedDays") || 0;
  const watchedDiscounts = watch("discounts") || 0;

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

  // Recálculo automático transparente
  const syncTotals = React.useCallback((days: number, unit: number) => {
    const total = Number((days * unit).toFixed(2));
    setValue("voucherCount", days);
    setValue("totalValue", total);
  }, [setValue]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      reset({
        id: voucherToEdit.id,
        employeeId: voucherToEdit.employeeId,
        referenceMonth: refDateStr,
        unitValue: voucherToEdit.unitValue,
        workedDays: voucherToEdit.workedDays,
        voucherCount: voucherToEdit.voucherCount,
        totalValue: voucherToEdit.totalValue,
        discounts: voucherToEdit.discounts || 0,
      });
    } else {
      reset({
        employeeId: "",
        referenceMonth: defaultRefDate,
        unitValue: 32.5,
        workedDays: 22,
        voucherCount: 22,
        totalValue: 715.0,
        discounts: 0,
      });
    }
  }, [voucherToEdit, reset, defaultRefDate, isOpen]);

  const onSubmit = async (data: MealVoucherFormData) => {
    setIsLoading(true);
    try {
      const payload: MealVoucherInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        unitValue: Number(data.unitValue),
        workedDays: Number(data.workedDays),
        voucherCount: Number(data.voucherCount || data.workedDays),
        totalValue: Number(data.totalValue || data.unitValue * data.workedDays),
        discounts: data.discounts ? Number(data.discounts) : 0,
      };

      const res = await upsertMealVoucher(payload);
      if (res.success) {
        toast.success(data.id ? "Vale Alimentação atualizado!" : "Vale Alimentação cadastrado com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Falha ao salvar Vale Alimentação.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedGross = watchedWorkedDays * watchedUnitValue;
  const calculatedNet = calculatedGross - watchedDiscounts;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-100">
                {voucherToEdit ? "Editar Vale Alimentação" : "Novo Vale Alimentação"}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400">
                Informe a diária e a quantidade de dias para emissão do recibo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
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

          <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Valores e Diárias
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Dias Trabalhados</Label>
                <Input
                  type="number"
                  {...register("workedDays", {
                    onChange: (e) => {
                      const days = parseInt(e.target.value, 10) || 0;
                      syncTotals(days, watchedUnitValue);
                    },
                  })}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-stone-400">Valor da Diária (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("unitValue", {
                    onChange: (e) => {
                      const unit = parseFloat(e.target.value) || 0;
                      syncTotals(watchedWorkedDays, unit);
                    },
                  })}
                  className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Label className="text-xs text-stone-400">Descontos / Coparticipação em Folha (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("discounts")}
                className="bg-stone-950 border-stone-700 text-stone-100 h-9 text-xs rounded-lg"
              />
            </div>
          </div>

          {/* Destaque do Valor Líquido */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total Bruto ({watchedWorkedDays} dias)
              </span>
              <span className="text-sm font-semibold text-stone-200">
                {formatCurrency(calculatedGross)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block">
                Líquido a Pagar
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(calculatedNet)}
              </span>
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
              className="bg-emerald-500 text-stone-950 hover:bg-emerald-400 font-bold px-5 rounded-xl shadow-md shadow-emerald-500/20"
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
