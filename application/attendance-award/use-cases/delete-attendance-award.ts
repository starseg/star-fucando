"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

export async function deleteAttendanceAward(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteAttendanceAwardRecord(id);
    revalidatePath("/assiduidade");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao excluir prêmio de assiduidade." };
  }
}
