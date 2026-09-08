"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaCommissionRepository } from "@/infrastructure/commission/prisma-commission.repository";
import { ICommissionRepository } from "@/domain/commission/commission.repository.interface";

const repository: ICommissionRepository = new PrismaCommissionRepository();

function serializeCommission<T extends { commissionValue: unknown }>(commission: T) {
  return { ...commission, commissionValue: toPlainMoney(commission.commissionValue) };
}

export async function getCommissionsForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const commissions = await repository.findCommissionsByIds(ids);
    return {
      success: true,
      data: commissions.map((c) => serializeCommission(c)),
    };
  } catch (error) {
    console.error("Erro ao buscar comissões para impressão:", error);
    return { success: false, error: "Falha ao buscar comissões para impressão." };
  }
}
