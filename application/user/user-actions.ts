"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/application/auth/auth-guard";
import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { CannotRejectOwnAccountError, CannotRevokeOwnAdminRoleError } from "@/domain/user/errors/user-errors";

export interface GetUsersPageParams {
  search?: string;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

function buildUserSearchWhere(search?: string) {
  return search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
}

export async function getUsersPage({ search, status, page = 1, pageSize = DEFAULT_PAGE_SIZE }: GetUsersPageParams = {}) {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const searchWhere = buildUserSearchWhere(search);
    const where = status ? { ...searchWhere, status } : searchWhere;
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...searchWhere, status: UserStatus.PENDING } }),
      prisma.user.count({ where: { ...searchWhere, status: UserStatus.APPROVED } }),
      prisma.user.count({ where: { ...searchWhere, status: UserStatus.REJECTED } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const users = await prisma.user.findMany({
      where,
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
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return {
      success: true,
      data: users,
      currentUserId: guard.user.id,
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        total: pendingCount + approvedCount + rejectedCount,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
    };
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

  try {
    if (id === guard.user.id) throw new CannotRejectOwnAccountError();

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.REJECTED,
      },
    });

    revalidatePath("/admin/aprovacoes");
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao rejeitar usuário:", error);
    return { success: false, error: "Falha ao rejeitar usuário." };
  }
}

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
