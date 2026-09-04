"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeRequiredError } from "@/domain/shared/errors/employee-required-error";
import { ReferenceMonthRequiredError } from "@/domain/shared/errors/reference-month-required-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { calculateNetValue } from "@/domain/meal-voucher/value-objects/meal-voucher-net-value";

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

const DEFAULT_PAGE_SIZE = 20;

function buildMealVoucherSearchWhere(search?: string) {
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

function serializeVoucher<T extends { unitValue: unknown; totalValue: unknown; discounts: unknown }>(voucher: T) {
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
    const where = {
      referenceMonth: { gte: start, lt: end },
      ...buildMealVoucherSearchWhere(search),
    };
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      prisma.mealVoucher.count({ where }),
      prisma.mealVoucher.aggregate({
        where,
        _sum: { totalValue: true, discounts: true, workedDays: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const vouchers = await prisma.mealVoucher.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

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

export async function upsertMealVoucher(input: MealVoucherInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) throw new EmployeeRequiredError();
    if (!input.referenceMonth) throw new ReferenceMonthRequiredError();

    const refDate = new Date(input.referenceMonth);

    if (input.id) {
      const voucher = await prisma.mealVoucher.update({
        where: { id: input.id },
        data: {
          employeeId: input.employeeId,
          referenceMonth: refDate,
          unitValue: input.unitValue,
          workedDays: input.workedDays,
          voucherCount: input.voucherCount,
          totalValue: input.totalValue,
          discounts: input.discounts ?? 0,
        },
        include: {
          employee: true,
        },
      });

      revalidatePath("/vale-alimentacao");
      return { success: true, data: serializeVoucher(voucher) };
    }

    const voucher = await prisma.mealVoucher.create({
      data: {
        employeeId: input.employeeId,
        referenceMonth: refDate,
        unitValue: input.unitValue,
        workedDays: input.workedDays,
        voucherCount: input.voucherCount,
        totalValue: input.totalValue,
        discounts: input.discounts ?? 0,
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/vale-alimentacao");
    return { success: true, data: serializeVoucher(voucher) };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao salvar vale alimentação:", error);
    return { success: false, error: "Falha ao salvar vale alimentação." };
  }
}

export async function deleteMealVoucher(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.mealVoucher.delete({ where: { id } });
    revalidatePath("/vale-alimentacao");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir vale alimentação:", error);
    return { success: false, error: "Falha ao excluir vale alimentação." };
  }
}

export async function getMealVouchersForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const vouchers = await prisma.mealVoucher.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

    return {
      success: true,
      data: vouchers.map((v) => serializeVoucher(v)),
    };
  } catch (error) {
    console.error("Erro ao buscar vales alimentação para impressão:", error);
    return { success: false, error: "Falha ao buscar vales para impressão." };
  }
}

export async function copyMealVouchers(
  sourceMonth: number,
  sourceYear: number,
  targetMonth: number,
  targetYear: number
) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    assertDifferentReferenceMonth(sourceMonth, sourceYear, targetMonth, targetYear);

    const { start: srcStart, end: srcEnd } = toReferenceMonthRange(sourceMonth, sourceYear);
    const { start: targetStart, end: targetEnd } = toReferenceMonthRange(targetMonth, targetYear);

    const sourceVouchers = await prisma.mealVoucher.findMany({
      where: {
        referenceMonth: {
          gte: srcStart,
          lt: srcEnd,
        },
      },
    });

    if (sourceVouchers.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await prisma.$transaction(async (tx) => {
      await tx.mealVoucher.deleteMany({
        where: {
          referenceMonth: {
            gte: targetStart,
            lt: targetEnd,
          },
        },
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

    revalidatePath("/vale-alimentacao");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar vales alimentação:", error);
    return { success: false, error: "Falha ao copiar vales alimentação do mês anterior." };
  }
}
