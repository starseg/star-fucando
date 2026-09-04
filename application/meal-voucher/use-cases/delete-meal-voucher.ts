"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { IMealVoucherRepository } from "@/domain/meal-voucher/meal-voucher.repository.interface";
import { PrismaMealVoucherRepository } from "@/infrastructure/meal-voucher/prisma-meal-voucher.repository";

const repository: IMealVoucherRepository = new PrismaMealVoucherRepository();

export async function deleteMealVoucher(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteMealVoucherRecord(id);
    revalidatePath("/vale-alimentacao");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir vale alimentação:", error);
    return { success: false, error: "Falha ao excluir vale alimentação." };
  }
}
