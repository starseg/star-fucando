"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { calculateNetValue } from "@/domain/meal-voucher/value-objects/meal-voucher-net-value";
import { MealVoucherData } from "./meal-voucher-table";
import { MealVoucherEmployeeMonthFields } from "./meal-voucher-employee-month-fields";
import { MealVoucherAmountFields } from "./meal-voucher-amount-fields";
import { MealVoucherTotalsSummary } from "./meal-voucher-totals-summary";
import { buildMealVoucherDefaultValues } from "./meal-voucher-form-defaults";
import { useMealVoucherSubmit } from "../hooks/use-meal-voucher-submit";

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
  voucherToEdit?: MealVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function MealVoucherForm({
  voucherToEdit,
  defaultMonth,
  defaultYear,
  onSuccess,
  onClose,
}: MealVoucherFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MealVoucherFormData>({
    resolver: zodResolver(mealVoucherSchema),
    defaultValues: buildMealVoucherDefaultValues(voucherToEdit, defaultMonth, defaultYear),
  });

  const { isLoading, persistMealVoucher } = useMealVoucherSubmit({ onSuccess, onClose });

  const watchedUnitValue = watch("unitValue") || 0;
  const watchedWorkedDays = watch("workedDays") || 0;
  const watchedDiscounts = watch("discounts") || 0;

  const syncTotals = (days: number, unit: number) => {
    const total = Number((days * unit).toFixed(2));
    setValue("voucherCount", days);
    setValue("totalValue", total);
  };

  const calculatedGross = watchedWorkedDays * watchedUnitValue;
  const calculatedNet = calculateNetValue(calculatedGross, watchedDiscounts);

  return (
    <form onSubmit={handleSubmit(persistMealVoucher)} className="space-y-4 pt-2">
      <MealVoucherEmployeeMonthFields
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
