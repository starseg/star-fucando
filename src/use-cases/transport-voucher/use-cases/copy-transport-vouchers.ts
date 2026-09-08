"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();

export async function copyTransportVouchers(
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

    const sourceVouchers = await repository.findTransportVouchersInRange(srcStart, srcEnd);

    if (sourceVouchers.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await repository.replaceTransportVouchersInRange(targetStart, targetEnd, sourceVouchers);

    revalidatePath("/vale-transporte");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar vales transporte:", error);
    return { success: false, error: "Falha ao copiar vales transporte do mGs anterior." };
  }
}
