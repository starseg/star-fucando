"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

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
    return { success: false, error: "Falha ao copiar prêmios de assiduidade do mês selecionado." };
  }
}
