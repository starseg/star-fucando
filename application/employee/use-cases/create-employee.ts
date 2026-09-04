"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { assertValidEmployeeName } from "@/domain/employee/value-objects/employee-name";
import { assertValidPixKey } from "@/domain/employee/value-objects/pix-key";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";
import { EmployeeInput } from "@/application/employee/employee-dto";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

export async function createEmployee(input: EmployeeInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const name = assertValidEmployeeName(input.name);
    const pix = assertValidPixKey(input.pix);

    const employee = await repository.createEmployeeRecord({
      name,
      pix,
      department: input.department?.trim() || null,
      role: input.role?.trim() || null,
      admissionDate: input.admissionDate ? new Date(input.admissionDate) : null,
    });

    revalidatePath("/colaboradores");
    updateTag("employees");
    return { success: true, data: employee };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao criar colaborador:", error);
    return { success: false, error: "Falha ao criar colaborador." };
  }
}
