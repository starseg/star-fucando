"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/use-cases/auth/auth-guard";
import { UserStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { CannotRejectOwnAccountError } from "@/domain/user/errors/user-errors";

export async function rejectUser(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (id === guard.user.id) throw new CannotRejectOwnAccountError();

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.REJECTED,
      },
    });

    revalidatePath("/admin/aprovacoes");
    revalidateTag("pending-count", { expire: 0 });
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao rejeitar usuário:", error);
    return { success: false, error: "Falha ao rejeitar usuário." };
  }
}
