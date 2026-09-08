"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { PrismaCommissionRepository } from "@/infrastructure/commission/prisma-commission.repository";
import { ICommissionRepository } from "@/domain/commission/commission.repository.interface";

const repository: ICommissionRepository = new PrismaCommissionRepository();

export async function copyCommissions(
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

    const sourceCommissions = await repository.findCommissionsInRange(srcStart, srcEnd);
    if (sourceCommissions.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await repository.replaceCommissionsInRange(targetStart, targetEnd, sourceCommissions);

    revalidatePath("/comissoes");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar comissões:", error);
    return { success: false, error: "Falha ao copiar comissões do mês anterior." };
  }
}
