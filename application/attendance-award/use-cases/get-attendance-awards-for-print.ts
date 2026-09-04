"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

function serializeAward<T extends { bonusValue: unknown }>(award: T) {
  return { ...award, bonusValue: toPlainMoney(award.bonusValue) };
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
