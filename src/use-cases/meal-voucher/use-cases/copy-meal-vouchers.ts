"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { IMealVoucherRepository } from "@/domain/meal-voucher/meal-voucher.repository.interface";
import { PrismaMealVoucherRepository } from "@/infrastructure/meal-voucher/prisma-meal-voucher.repository";

const repository: IMealVoucherRepository = new PrismaMealVoucherRepository();

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

    const sourceVouchers = await repository.findMealVouchersInRange(srcStart, srcEnd);
    if (sourceVouchers.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await repository.replaceMealVouchersInRange(targetStart, targetEnd, sourceVouchers);

    revalidatePath("/vale-alimentacao");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar vales alimentação:", error);
    return { success: false, error: "Falha ao copiar vales alimentação do mês anterior." };
  }
}
