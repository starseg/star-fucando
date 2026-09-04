"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();

export async function deleteTransportVoucher(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteTransportVoucherCascade(id);

    revalidatePath("/vale-transporte");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir vale transporte:", error);
    return { success: false, error: "Falha ao excluir vale transporte." };
  }
}
