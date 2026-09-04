"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/application/auth/auth-guard";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { CannotRevokeOwnAdminRoleError } from "@/domain/user/errors/user-errors";

export async function setUserRole(id: string, role: UserRole) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (id === guard.user.id && role !== UserRole.ADMIN) throw new CannotRevokeOwnAdminRoleError();

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    revalidatePath("/admin/aprovacoes");
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao alterar papel do usuário:", error);
    return { success: false, error: "Falha ao alterar papel do usuário." };
  }
}
