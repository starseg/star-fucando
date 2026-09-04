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

export interface AttendanceAwardInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  bonusValue: number;
}

export interface GetAttendanceAwardsPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

function buildAttendanceAwardSearchWhere(search?: string) {
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

function serializeAward<T extends { bonusValue: unknown }>(award: T) {
  return { ...award, bonusValue: toPlainMoney(award.bonusValue) };
}

export async function getAttendanceAwardsPage({
  search,
  month,
  year,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetAttendanceAwardsPageParams) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const { start, end } = toReferenceMonthRange(month, year);
    const where = {
      referenceMonth: { gte: start, lt: end },
      ...buildAttendanceAwardSearchWhere(search),
    };
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      prisma.attendanceAward.count({ where }),
      prisma.attendanceAward.aggregate({ where, _sum: { bonusValue: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const awards = await prisma.attendanceAward.findMany({
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

    const totalBonusSum = toPlainMoney(aggregate._sum.bonusValue ?? 0);

    return {
      success: true,
      data: awards.map((a) => serializeAward(a)),
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        totalBonusSum,
        employeesCount: total,
        averageBonus: total > 0 ? toPlainMoney(totalBonusSum / total) : 0,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar prêmios de assiduidade:", error);
    return { success: false, error: "Falha ao buscar prêmios de assiduidade." };
  }
}

export async function upsertAttendanceAward(input: AttendanceAwardInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) throw new EmployeeRequiredError();
    if (!input.referenceMonth) throw new ReferenceMonthRequiredError();

    const refDate = new Date(input.referenceMonth);

    if (input.id) {
      const award = await prisma.attendanceAward.update({
        where: { id: input.id },
        data: {
          employeeId: input.employeeId,
          referenceMonth: refDate,
          bonusValue: input.bonusValue,
        },
        include: {
          employee: true,
        },
      });

      revalidatePath("/assiduidade");
      return { success: true, data: serializeAward(award) };
    }

    const award = await prisma.attendanceAward.create({
      data: {
        employeeId: input.employeeId,
        referenceMonth: refDate,
        bonusValue: input.bonusValue,
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/assiduidade");
    return { success: true, data: serializeAward(award) };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao salvar prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao salvar prêmio de assiduidade." };
  }
}

export async function deleteAttendanceAward(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.attendanceAward.delete({ where: { id } });
    revalidatePath("/assiduidade");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao excluir prêmio de assiduidade." };
  }
}

export async function getAttendanceAwardsForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const awards = await prisma.attendanceAward.findMany({
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
      data: awards.map((a) => serializeAward(a)),
    };
  } catch (error) {
    console.error("Erro ao buscar prêmios de assiduidade para impressão:", error);
    return { success: false, error: "Falha ao buscar prêmios para impressão." };
  }
}

export async function copyAttendanceAwards(
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

    const sourceAwards = await prisma.attendanceAward.findMany({
      where: {
        referenceMonth: {
          gte: srcStart,
          lt: srcEnd,
        },
      },
    });

    if (sourceAwards.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await prisma.$transaction(async (tx) => {
      await tx.attendanceAward.deleteMany({
        where: {
          referenceMonth: {
            gte: targetStart,
            lt: targetEnd,
          },
        },
      });

      for (const a of sourceAwards) {
        await tx.attendanceAward.create({
          data: {
            employeeId: a.employeeId,
            referenceMonth: targetStart,
            bonusValue: a.bonusValue,
          },
        });
      }

      return sourceAwards.length;
    });

    revalidatePath("/assiduidade");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar prêmios de assiduidade:", error);
    return { success: false, error: "Falha ao copiar prêmios de assiduidade do mês anterior." };
  }
}
