"use server";

import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

export async function getEmployeeOptions() {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const employees = await repository.findEmployeeOptions();
    return { success: true, data: employees };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: "Falha ao buscar colaboradores." };
  }
}
