"use server";

import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { calculateNetValue } from "@/domain/meal-voucher/value-objects/meal-voucher-net-value";
import { IMealVoucherRepository } from "@/domain/meal-voucher/meal-voucher.repository.interface";
import { PrismaMealVoucherRepository } from "@/infrastructure/meal-voucher/prisma-meal-voucher.repository";
import { GetMealVouchersPageParams } from "../meal-voucher-dto";
import { serializeVoucher } from "../meal-voucher-utils";

const repository: IMealVoucherRepository = new PrismaMealVoucherRepository();
const DEFAULT_PAGE_SIZE = 20;

export async function getMealVouchersPage({
  search,
  month,
  year,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetMealVouchersPageParams) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const { start, end } = toReferenceMonthRange(month, year);
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      repository.countMealVouchersInRange(search, start, end),
      repository.sumMealVouchersInRange(search, start, end),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const vouchers = await repository.findMealVouchersPage({ search, start, end, page: currentPage, pageSize });

    const grossSum = toPlainMoney(aggregate._sum.totalValue ?? 0);
    const discountsSum = toPlainMoney(aggregate._sum.discounts ?? 0);

    return {
      success: true,
      data: vouchers.map((v) => serializeVoucher(v)),
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        totalNetSum: calculateNetValue(grossSum, discountsSum),
        employeesCount: total,
        totalDaysSum: aggregate._sum.workedDays ?? 0,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar vales alimentação:", error);
    return { success: false, error: "Falha ao buscar vales alimentação." };
  }
}
