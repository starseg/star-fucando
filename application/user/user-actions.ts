"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/application/auth/auth-guard";
import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUsers(statusFilter?: UserStatus) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const users = await prisma.user.findMany({
      where: statusFilter ? { status: statusFilter } : {},
      include: {
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { success: false, error: "Falha ao buscar usuários." };
  }
}

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

export async function rejectUser(id: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (id === guard.user.id) {
    return { success: false, error: "Você não pode rejeitar seu próprio usuário." };
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.REJECTED,
      },
    });

    revalidatePath("/admin/aprovacoes");
    return { success: true, data: user };
  } catch (error) {
    console.error("Erro ao rejeitar usuário:", error);
    return { success: false, error: "Falha ao rejeitar usuário." };
  }
}

export async function setUserRole(id: string, role: UserRole) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (id === guard.user.id && role !== UserRole.ADMIN) {
    return { success: false, error: "Você não pode revogar seus próprios privilégios de administrador." };
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    revalidatePath("/admin/aprovacoes");
    return { success: true, data: user };
  } catch (error) {
    console.error("Erro ao alterar papel do usuário:", error);
    return { success: false, error: "Falha ao alterar papel do usuário." };
  }
}

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
