import type { MealVoucher, Employee } from "@prisma/client";

export interface MealVoucherPageParams {
  search?: string;
  start: Date;
  end: Date;
  page: number;
  pageSize: number;
}

export interface MealVoucherRecordInput {
  employeeId: string;
  referenceMonth: Date;
  unitValue: number;
  workedDays: number;
  voucherCount: number;
  totalValue: number;
  discounts: number;
}

export type MealVoucherWithEmployee = MealVoucher & { employee: Employee };

import { Decimal } from "@prisma/client/runtime/library";

export interface IMealVoucherRepository {
  countMealVouchersInRange(search: string | undefined, start: Date, end: Date): Promise<number>;
  sumMealVouchersInRange(search: string | undefined, start: Date, end: Date): Promise<{ _sum: { totalValue: Decimal | null, discounts: Decimal | null, workedDays: number | null } }>;
  findMealVouchersPage(params: MealVoucherPageParams): Promise<MealVoucherWithEmployee[]>;
  createMealVoucherRecord(data: MealVoucherRecordInput): Promise<MealVoucherWithEmployee>;
  updateMealVoucherRecord(id: string, data: MealVoucherRecordInput): Promise<MealVoucherWithEmployee>;
  deleteMealVoucherRecord(id: string): Promise<MealVoucher>;
  findMealVouchersByIds(ids: string[]): Promise<MealVoucherWithEmployee[]>;
  findMealVouchersInRange(start: Date, end: Date): Promise<MealVoucher[]>;
  replaceMealVouchersInRange(targetStart: Date, targetEnd: Date, sourceVouchers: MealVoucher[]): Promise<number>;
}
