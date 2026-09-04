"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeNotFoundError } from "@/domain/employee/errors/employee-errors";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

export async function getEmployeeById(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const employee = await repository.findEmployeeById(id);
    if (!employee) throw new EmployeeNotFoundError();
    return { success: true, data: employee };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao buscar colaborador:", error);
    return { success: false, error: "Falha ao buscar colaborador." };
  }
}
