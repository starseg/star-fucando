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
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const mealVoucherSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione um colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  unitValue: z.coerce.number().min(0, "Valor unitário não pode ser negativo"),
  workedDays: z.coerce.number().min(0, "Dias trabalhados não pode ser negativo"),
  voucherCount: z.coerce.number().min(0, "Quantidade de vales não pode ser negativa"),
  totalValue: z.coerce.number().min(0, "Valor total não pode ser negativo"),
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

  const watchedUnitValue = watch("unitValue");
  const watchedWorkedDays = watch("workedDays");
  const watchedDiscounts = watch("discounts") || 0;
  const watchedTotal = watch("totalValue");

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

  React.useEffect(() => {
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

  const handleCalculateTotal = () => {
    const total = Number(watchedUnitValue || 0) * Number(watchedWorkedDays || 0);
    setValue("voucherCount", Number(watchedWorkedDays || 0));
    setValue("totalValue", Number(total.toFixed(2)));
  };

  const onSubmit = async (data: MealVoucherFormData) => {
    setIsLoading(true);
    try {
      const payload: MealVoucherInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        unitValue: Number(data.unitValue),
        workedDays: Number(data.workedDays),
        voucherCount: Number(data.voucherCount),
        totalValue: Number(data.totalValue),
        discounts: data.discounts ? Number(data.discounts) : 0,
      };

      const res = await upsertMealVoucher(payload);
      if (res.success) {
        toast.success(data.id ? "Vale Alimentação atualizado!" : "Vale Alimentação cadastrado!");
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

  const netValue = (watchedTotal || 0) - (watchedDiscounts || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-stone-900 border-stone-800 text-stone-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-100">
            {voucherToEdit ? "Editar Vale Alimentação" : "Novo Vale Alimentação"}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Lançamento de Vale Alimentação / Refeição para o colaborador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-stone-300">Valor Unitário Diário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("unitValue", {
                  onChange: handleCalculateTotal,
                })}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-stone-300">Dias Trabalhados</Label>
              <Input
                type="number"
                {...register("workedDays", {
                  onChange: handleCalculateTotal,
                })}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-stone-300">Qtd. de Vales / Diárias</Label>
              <Input
                type="number"
                {...register("voucherCount")}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-stone-300">Descontos / Coparticipação (R$)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("discounts")}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>
          </div>

          <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block">Total Bruto</span>
              <span className="text-sm font-semibold text-stone-200">{formatCurrency(watchedTotal)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-400 font-medium block">Valor Líquido a Receber</span>
              <span className="text-base font-bold text-emerald-400">{formatCurrency(netValue)}</span>
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
              className="bg-emerald-500 text-stone-950 hover:bg-emerald-400 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : voucherToEdit ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
