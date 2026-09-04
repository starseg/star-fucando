"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeRequiredError } from "@/domain/shared/errors/employee-required-error";
import { ReferenceMonthRequiredError } from "@/domain/shared/errors/reference-month-required-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

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
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      repository.countAttendanceAwardsInRange(search, start, end),
      repository.sumAttendanceAwardsInRange(search, start, end),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const awards = await repository.findAttendanceAwardsPage({ search, start, end, page: currentPage, pageSize });

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

    const recordInput = {
      employeeId: input.employeeId,
      referenceMonth: new Date(input.referenceMonth),
      bonusValue: input.bonusValue,
    };

    const award = input.id
      ? await repository.updateAttendanceAwardRecord(input.id, recordInput)
      : await repository.createAttendanceAwardRecord(recordInput);

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
    await repository.deleteAttendanceAwardRecord(id);
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
    const awards = await repository.findAttendanceAwardsByIds(ids);
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

    const sourceAwards = await repository.findAttendanceAwardsInRange(srcStart, srcEnd);
    if (sourceAwards.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await repository.replaceAttendanceAwardsInRange(targetStart, targetEnd, sourceAwards);

    revalidatePath("/assiduidade");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar prêmios de assiduidade:", error);
    return { success: false, error: "Falha ao copiar prêmios de assiduidade do mês anterior." };
  }
}
