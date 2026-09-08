"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

export async function getTechnicianOptions() {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const employees = await repository.findTechnicianOptions();
    return { success: true, data: employees };
  } catch (error) {
    console.error("Erro ao buscar técnicos:", error);
    return { success: false, error: "Falha ao buscar técnicos." };
  }
}
