export interface MealVoucherInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  unitValue: number;
  workedDays: number;
  voucherCount: number;
  totalValue: number;
  discounts?: number | null;
}

export interface GetMealVouchersPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}
