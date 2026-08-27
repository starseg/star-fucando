"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";

export interface AttendanceAwardInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  bonusValue: number;
}

export async function getAttendanceAwards(month: number, year: number) {
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
