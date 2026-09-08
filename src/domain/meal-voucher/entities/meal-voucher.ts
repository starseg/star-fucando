export interface MealVoucher {
  id: string;
  employeeId: string;
  referenceMonth: Date;
  unitValue: number;
  workedDays: number;
  voucherCount: number;
  totalValue: number;
  discounts: number;
}
