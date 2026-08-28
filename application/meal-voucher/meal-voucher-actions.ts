"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";

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

export async function getMealVouchers(month: number, year: number) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const vouchers = await prisma.mealVoucher.findMany({
      where: {
        referenceMonth: {
          gte: startDate,
          lt: endDate,
        },
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
      data: vouchers.map((v) => ({
        ...v,
        unitValue: Number(v.unitValue),
        totalValue: Number(v.totalValue),
        discounts: v.discounts ? Number(v.discounts) : 0,
        netValue: Number(v.totalValue) - (v.discounts ? Number(v.discounts) : 0),
      })),
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
    if (!input.employeeId) {
      return { success: false, error: "Colaborador é obrigatório." };
    }
    if (!input.referenceMonth) {
      return { success: false, error: "Mês de referência é obrigatório." };
    }

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
      return { success: true, data: voucher };
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
    return { success: true, data: voucher };
  } catch (error) {
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
      data: vouchers.map((v) => ({
        ...v,
        unitValue: Number(v.unitValue),
        totalValue: Number(v.totalValue),
        discounts: v.discounts ? Number(v.discounts) : 0,
        netValue: Number(v.totalValue) - (v.discounts ? Number(v.discounts) : 0),
      })),
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

  if (sourceMonth === targetMonth && sourceYear === targetYear) {
    return { success: false, error: "O mês de origem não pode ser igual ao mês de destino." };
  }

  try {
    const srcStartDate = new Date(Date.UTC(sourceYear, sourceMonth - 1, 1));
    const srcEndDate = new Date(Date.UTC(sourceYear, sourceMonth, 1));
    const targetRefDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const targetEndDate = new Date(Date.UTC(targetYear, targetMonth, 1));

    const sourceVouchers = await prisma.mealVoucher.findMany({
      where: {
        referenceMonth: {
          gte: srcStartDate,
          lt: srcEndDate,
        },
      },
    });

    if (sourceVouchers.length === 0) {
      return {
        success: false,
        error: "Nenhum lançamento encontrado no mês de origem para copiar.",
      };
    }

    const createdCount = await prisma.$transaction(async (tx) => {
      await tx.mealVoucher.deleteMany({
        where: {
          referenceMonth: {
            gte: targetRefDate,
            lt: targetEndDate,
          },
        },
      });

      for (const v of sourceVouchers) {
        await tx.mealVoucher.create({
          data: {
            employeeId: v.employeeId,
            referenceMonth: targetRefDate,
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
    console.error("Erro ao copiar vales alimentação:", error);
    return { success: false, error: "Falha ao copiar vales alimentação do mês anterior." };
  }
}
