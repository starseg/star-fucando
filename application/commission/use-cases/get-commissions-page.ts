"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaCommissionRepository } from "@/infrastructure/commission/prisma-commission.repository";
import { ICommissionRepository } from "@/domain/commission/commission.repository.interface";
import { GetCommissionsPageParams } from "../commission-dto";

const repository: ICommissionRepository = new PrismaCommissionRepository();

const DEFAULT_PAGE_SIZE = 20;

function serializeCommission<T extends { commissionValue: unknown }>(commission: T) {
  return { ...commission, commissionValue: toPlainMoney(commission.commissionValue) };
}

export async function getCommissionsPage({
  search,
  month,
  year,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetCommissionsPageParams) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const { start, end } = toReferenceMonthRange(month, year);
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      repository.countCommissionsInRange(search, start, end),
      repository.sumCommissionsInRange(search, start, end),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const commissions = await repository.findCommissionsPage({ search, start, end, page: currentPage, pageSize });

    const totalCommissionSum = toPlainMoney(aggregate._sum.commissionValue ?? 0);

    return {
      success: true,
      data: commissions.map((c) => serializeCommission(c)),
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        totalCommissionSum,
        employeesCount: total,
        averageCommission: total > 0 ? toPlainMoney(totalCommissionSum / total) : 0,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar comissões:", error);
    return { success: false, error: "Falha ao buscar comissões." };
  }
}
