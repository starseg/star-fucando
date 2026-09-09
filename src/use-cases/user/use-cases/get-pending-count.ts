"use server";

import { unstable_cache } from "next/cache";
import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/use-cases/auth/auth-guard";
import { UserStatus } from "@prisma/client";

const getCachedPendingCount = unstable_cache(
  () => prisma.user.count({ where: { status: UserStatus.PENDING } }),
  ["pending-users-count"],
  { tags: ["pending-count"], revalidate: 60 }
);

export async function getPendingCount() {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error, count: 0 };

  try {
    const count = await getCachedPendingCount();
    return { success: true, count };
  } catch (error) {
    console.error("Erro ao contar usuários pendentes:", error);
    return { success: false, error: "Falha ao obter contagem de pendências.", count: 0 };
  }
}
