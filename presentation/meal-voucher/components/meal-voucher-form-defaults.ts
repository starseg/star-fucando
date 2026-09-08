import type { MealVoucherData } from "./meal-voucher-table";
import type { MealVoucherFormData } from "./meal-voucher-form";

function buildDefaultRefDate(defaultMonth?: number, defaultYear?: number) {
  const year = defaultYear || new Date().getFullYear();
  const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function buildMealVoucherDefaultValues(
  voucherToEdit: MealVoucherData | null | undefined,
  defaultMonth?: number,
  defaultYear?: number
): MealVoucherFormData {
  if (voucherToEdit) {
    return {
      id: voucherToEdit.id,
      employeeId: voucherToEdit.employeeId,
      referenceMonth: new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0],
      unitValue: voucherToEdit.unitValue,
      workedDays: voucherToEdit.workedDays,
      voucherCount: voucherToEdit.voucherCount,
      totalValue: voucherToEdit.totalValue,
      discounts: voucherToEdit.discounts || 0,
    };
  }

  return {
    employeeId: "",
    referenceMonth: buildDefaultRefDate(defaultMonth, defaultYear),
    unitValue: 32.5,
    workedDays: 22,
    voucherCount: 22,
    totalValue: 715.0,
    discounts: 0,
  };
}
