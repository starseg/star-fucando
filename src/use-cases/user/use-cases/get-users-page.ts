"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { requireAdmin } from "@/use-cases/auth/auth-guard";
import { UserStatus } from "@prisma/client";
import { GetUsersPageParams } from "@/use-cases/user/user-dto";

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
