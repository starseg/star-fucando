"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { upsertMealVoucher, MealVoucherInput } from "@/application/meal-voucher/meal-voucher-actions";
import { calculateNetValue } from "@/domain/meal-voucher/value-objects/meal-voucher-net-value";
import { MealVoucherData } from "./meal-voucher-table";
import { MealVoucherEmployeeMonthFields } from "./meal-voucher-employee-month-fields";
import { MealVoucherAmountFields } from "./meal-voucher-amount-fields";
import { MealVoucherTotalsSummary } from "./meal-voucher-totals-summary";
import { toast } from "sonner";

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

export type MealVoucherFormData = z.infer<typeof mealVoucherSchema>;

interface MealVoucherFormProps {
  employees: { id: string; name: string }[];
  voucherToEdit?: MealVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess: () => void;
  onClose: () => void;
}

function buildDefaultRefDate(defaultMonth?: number, defaultYear?: number) {
  const year = defaultYear || new Date().getFullYear();
  const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function MealVoucherForm({
  employees,
  voucherToEdit,
  defaultMonth,
  defaultYear,
  onSuccess,
  onClose,
}: MealVoucherFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MealVoucherFormData>({
    resolver: zodResolver(mealVoucherSchema),
    defaultValues: voucherToEdit
      ? {
          id: voucherToEdit.id,
          employeeId: voucherToEdit.employeeId,
          referenceMonth: new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0],
          unitValue: voucherToEdit.unitValue,
          workedDays: voucherToEdit.workedDays,
          voucherCount: voucherToEdit.voucherCount,
          totalValue: voucherToEdit.totalValue,
          discounts: voucherToEdit.discounts || 0,
        }
      : {
          employeeId: "",
          referenceMonth: buildDefaultRefDate(defaultMonth, defaultYear),
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

  const syncTotals = (days: number, unit: number) => {
    const total = Number((days * unit).toFixed(2));
    setValue("voucherCount", days);
    setValue("totalValue", total);
  };

  const persistMealVoucher = async (data: MealVoucherFormData) => {
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
  const calculatedNet = calculateNetValue(calculatedGross, watchedDiscounts);

  return (
    <form onSubmit={handleSubmit(persistMealVoucher)} className="space-y-4 pt-2">
      <MealVoucherEmployeeMonthFields
        employees={employees}
        employeeId={watch("employeeId")}
        onEmployeeIdChange={(val) => setValue("employeeId", val)}
        employeeIdError={errors.employeeId?.message}
        register={register}
      />

      <MealVoucherAmountFields
        register={register}
        onWorkedDaysChange={(days) => syncTotals(days, watchedUnitValue)}
        onUnitValueChange={(unit) => syncTotals(watchedWorkedDays, unit)}
      />

      <MealVoucherTotalsSummary
        workedDays={watchedWorkedDays}
        grossValue={calculatedGross}
        netValue={calculatedNet}
      />

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={voucherToEdit ? "Salvar Alterações" : "Cadastrar Lançamento"}
        color="emerald"
      />
    </form>
  );
}
