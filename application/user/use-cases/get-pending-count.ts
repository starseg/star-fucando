"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/application/auth/auth-guard";
import { UserStatus } from "@prisma/client";

export async function getPendingCount() {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error, count: 0 };

  try {
    const count = await prisma.user.count({
      where: { status: UserStatus.PENDING },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Erro ao contar usuários pendentes:", error);
    return { success: false, error: "Falha ao obter contagem de pendências.", count: 0 };
  }
}
