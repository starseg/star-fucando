import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { calculateNetValue } from "@/domain/meal-voucher/value-objects/meal-voucher-net-value";

export function serializeVoucher<T extends { unitValue: unknown; totalValue: unknown; discounts: unknown }>(voucher: T) {
  const totalValue = toPlainMoney(voucher.totalValue);
  const discounts = voucher.discounts != null ? toPlainMoney(voucher.discounts) : 0;
  return {
    ...voucher,
    unitValue: toPlainMoney(voucher.unitValue),
    totalValue,
    discounts,
    netValue: calculateNetValue(totalValue, discounts),
  };
}
