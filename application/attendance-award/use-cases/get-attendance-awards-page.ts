"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";
import { GetAttendanceAwardsPageParams } from "../attendance-award-dto";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

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
