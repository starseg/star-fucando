import * as React from "react";
import { toast } from "sonner";
import { upsertMealVoucher } from "@/application/meal-voucher/use-cases/upsert-meal-voucher";
import { MealVoucherInput } from "@/application/meal-voucher/meal-voucher-dto";
import type { MealVoucherFormData } from "../components/meal-voucher-form";

interface UseMealVoucherSubmitOptions {
  onSuccess: () => void;
  onClose: () => void;
}

export function useMealVoucherSubmit({ onSuccess, onClose }: UseMealVoucherSubmitOptions) {
  const [isLoading, setIsLoading] = React.useState(false);

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

  return { isLoading, persistMealVoucher };
}
