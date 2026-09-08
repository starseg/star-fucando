"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

export async function deleteEmployee(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteEmployeeCascade(id);

    revalidatePath("/colaboradores");
    updateTag("employees");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return { success: false, error: "Falha ao excluir colaborador." };
  }
}
