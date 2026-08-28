"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";

export interface AttendanceAwardInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  bonusValue: number;
}

export async function getAttendanceAwards(month: number, year: number) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const awards = await prisma.attendanceAward.findMany({
      where: {
        referenceMonth: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

    return {
      success: true,
      data: awards.map((a) => ({
        ...a,
        bonusValue: Number(a.bonusValue),
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar prêmios de assiduidade:", error);
    return { success: false, error: "Falha ao buscar prêmios de assiduidade." };
  }
}

export async function upsertAttendanceAward(input: AttendanceAwardInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) {
      return { success: false, error: "Colaborador é obrigatório." };
    }
    if (!input.referenceMonth) {
      return { success: false, error: "Mês de referência é obrigatório." };
    }

    const refDate = new Date(input.referenceMonth);

    if (input.id) {
      const award = await prisma.attendanceAward.update({
        where: { id: input.id },
        data: {
          employeeId: input.employeeId,
          referenceMonth: refDate,
          bonusValue: input.bonusValue,
        },
        include: {
          employee: true,
        },
      });

      revalidatePath("/assiduidade");
      return { success: true, data: award };
    }

    const award = await prisma.attendanceAward.create({
      data: {
        employeeId: input.employeeId,
        referenceMonth: refDate,
        bonusValue: input.bonusValue,
      },
      include: {
        employee: true,
      },
    });

    revalidatePath("/assiduidade");
    return { success: true, data: award };
  } catch (error) {
    console.error("Erro ao salvar prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao salvar prêmio de assiduidade." };
  }
}

export async function deleteAttendanceAward(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await prisma.attendanceAward.delete({ where: { id } });
    revalidatePath("/assiduidade");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao excluir prêmio de assiduidade." };
  }
}

export async function getAttendanceAwardsForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const awards = await prisma.attendanceAward.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

    return {
      success: true,
      data: awards.map((a) => ({
        ...a,
        bonusValue: Number(a.bonusValue),
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar prêmios de assiduidade para impressão:", error);
    return { success: false, error: "Falha ao buscar prêmios para impressão." };
  }
}

export async function copyAttendanceAwards(
  sourceMonth: number,
  sourceYear: number,
  targetMonth: number,
  targetYear: number
) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  if (sourceMonth === targetMonth && sourceYear === targetYear) {
    return { success: false, error: "O mês de origem não pode ser igual ao mês de destino." };
  }

  try {
    const srcStartDate = new Date(Date.UTC(sourceYear, sourceMonth - 1, 1));
    const srcEndDate = new Date(Date.UTC(sourceYear, sourceMonth, 1));
    const targetRefDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const targetEndDate = new Date(Date.UTC(targetYear, targetMonth, 1));

    const sourceAwards = await prisma.attendanceAward.findMany({
      where: {
        referenceMonth: {
          gte: srcStartDate,
          lt: srcEndDate,
        },
      },
    });

    if (sourceAwards.length === 0) {
      return {
        success: false,
        error: "Nenhum lançamento encontrado no mês de origem para copiar.",
      };
    }

    const createdCount = await prisma.$transaction(async (tx) => {
      await tx.attendanceAward.deleteMany({
        where: {
          referenceMonth: {
            gte: targetRefDate,
            lt: targetEndDate,
          },
        },
      });

      for (const a of sourceAwards) {
        await tx.attendanceAward.create({
          data: {
            employeeId: a.employeeId,
            referenceMonth: targetRefDate,
            bonusValue: a.bonusValue,
          },
        });
      }

      return sourceAwards.length;
    });

    revalidatePath("/assiduidade");
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Erro ao copiar prêmios de assiduidade:", error);
    return { success: false, error: "Falha ao copiar prêmios de assiduidade do mês anterior." };
  }
}
