"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { PrismaCommissionRepository } from "@/infrastructure/commission/prisma-commission.repository";
import { ICommissionRepository } from "@/domain/commission/commission.repository.interface";

const repository: ICommissionRepository = new PrismaCommissionRepository();

export async function deleteCommission(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteCommissionRecord(id);
    revalidatePath("/comissoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir comissão:", error);
    return { success: false, error: "Falha ao excluir comissão." };
  }
}
