import { prisma } from "@/infrastructure/db/prisma";
import type { MealVoucher } from "@prisma/client";
import {
  IMealVoucherRepository,
  MealVoucherPageParams,
  MealVoucherRecordInput,
} from "@/domain/meal-voucher/meal-voucher.repository.interface";

export class PrismaMealVoucherRepository implements IMealVoucherRepository {
  private buildMealVoucherSearchWhere(search?: string) {
    return search
      ? {
          employee: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { department: { contains: search, mode: "insensitive" as const } },
              { role: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {};
  }

  private buildMealVoucherWhere(search: string | undefined, start: Date, end: Date) {
    return {
      referenceMonth: { gte: start, lt: end },
      ...this.buildMealVoucherSearchWhere(search),
    };
  }

  async countMealVouchersInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.mealVoucher.count({ where: this.buildMealVoucherWhere(search, start, end) });
  }

  async sumMealVouchersInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.mealVoucher.aggregate({
      where: this.buildMealVoucherWhere(search, start, end),
      _sum: { totalValue: true, discounts: true, workedDays: true },
    });
  }

  async findMealVouchersPage({ search, start, end, page, pageSize }: MealVoucherPageParams) {
    return prisma.mealVoucher.findMany({
      where: this.buildMealVoucherWhere(search, start, end),
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createMealVoucherRecord(data: MealVoucherRecordInput) {
    return prisma.mealVoucher.create({ data, include: { employee: true } });
  }

  async updateMealVoucherRecord(id: string, data: MealVoucherRecordInput) {
    return prisma.mealVoucher.update({ where: { id }, data, include: { employee: true } });
  }

  async deleteMealVoucherRecord(id: string) {
    return prisma.mealVoucher.delete({ where: { id } });
  }

  async findMealVouchersByIds(ids: string[]) {
    return prisma.mealVoucher.findMany({
      where: { id: { in: ids } },
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
    });
  }

  async findMealVouchersInRange(start: Date, end: Date) {
    return prisma.mealVoucher.findMany({ where: { referenceMonth: { gte: start, lt: end } } });
  }

  async replaceMealVouchersInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceVouchers: MealVoucher[]
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.mealVoucher.deleteMany({
        where: { referenceMonth: { gte: targetStart, lt: targetEnd } },
      });

      for (const v of sourceVouchers) {
        await tx.mealVoucher.create({
          data: {
            employeeId: v.employeeId,
            referenceMonth: targetStart,
            unitValue: v.unitValue,
            workedDays: v.workedDays,
            voucherCount: v.voucherCount,
            totalValue: v.totalValue,
            discounts: v.discounts,
          },
        });
      }

      return sourceVouchers.length;
    });
  }
}
