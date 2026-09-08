"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/use-cases/auth/auth-guard";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function approveUser(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.APPROVED,
        approvedAt: new Date(),
        approvedById: guard.user.id,
      },
    });

    revalidatePath("/admin/aprovacoes");
    return { success: true, data: user };
  } catch (error) {
    console.error("Erro ao aprovar usuário:", error);
    return { success: false, error: "Falha ao aprovar usuário." };
  }
}
