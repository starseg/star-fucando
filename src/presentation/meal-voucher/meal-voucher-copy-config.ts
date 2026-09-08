import { copyMealVouchers } from "@/use-cases/meal-voucher/use-cases/copy-meal-vouchers";
import type { CopyPreviousMonthConfig } from "@/presentation/shared/copy-previous-month/copy-previous-month.types";

export const mealVoucherCopyConfig: CopyPreviousMonthConfig = {
  benefitTitle: "Vale Alimentação",
  accentColor: "emerald",
  onCopy: copyMealVouchers,
};
