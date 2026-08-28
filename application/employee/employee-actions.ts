"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";

export interface EmployeeInput {
  name: string;
  department?: string | null;
  role?: string | null;
  admissionDate?: string | null;
}

export async function getEmployees(search?: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { department: { contains: search, mode: "insensitive" as const } },
            { role: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            transportVoucher: true,
            mealVoucher: true,
            attendanceAward: true,
          },
        },
      },
    });

    return { success: true, data: employees };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: "Falha ao buscar colaboradores." };
  }
}

export async function getEmployeeById(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) return { success: false, error: "Colaborador não encontrado." };
    return { success: true, data: employee };
  } catch (error) {
    console.error("Erro ao buscar colaborador:", error);
    return { success: false, error: "Falha ao buscar colaborador." };
  }
}

export async function createEmployee(input: EmployeeInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.name || input.name.trim() === "") {
      return { success: false, error: "O nome do colaborador é obrigatório." };
    }

    const employee = await prisma.employee.create({
      data: {
        name: input.name.trim(),
        department: input.department?.trim() || null,
        role: input.role?.trim() || null,
        admissionDate: input.admissionDate ? new Date(input.admissionDate) : null,
      },
    });

    revalidatePath("/colaboradores");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return { success: false, error: "Falha ao criar colaborador." };
  }
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.name || input.name.trim() === "") {
      return { success: false, error: "O nome do colaborador é obrigatório." };
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: input.name.trim(),
        department: input.department?.trim() || null,
        role: input.role?.trim() || null,
        admissionDate: input.admissionDate ? new Date(input.admissionDate) : null,
      },
    });

    revalidatePath("/colaboradores");
    return { success: true, data: employee };
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return { success: false, error: "Falha ao atualizar colaborador." };
  }
}

export async function deleteEmployee(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    // Excluir registros dependentes antes de excluir o colaborador
    await prisma.transportModal.deleteMany({
      where: {
        transportVoucher: {
          employeeId: id,
        },
      },
    });
    await prisma.transportVoucher.deleteMany({ where: { employeeId: id } });
    await prisma.mealVoucher.deleteMany({ where: { employeeId: id } });
    await prisma.attendanceAward.deleteMany({ where: { employeeId: id } });

    await prisma.employee.delete({
      where: { id },
    });

    revalidatePath("/colaboradores");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return { success: false, error: "Falha ao excluir colaborador." };
  }
}
