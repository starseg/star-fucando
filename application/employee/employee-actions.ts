"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath, updateTag, unstable_cache } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeNotFoundError } from "@/domain/employee/errors/employee-errors";
import { assertValidEmployeeName } from "@/domain/employee/value-objects/employee-name";
import { assertValidPixKey } from "@/domain/employee/value-objects/pix-key";

export interface EmployeeInput {
  name: string;
  pix: string;
  department?: string | null;
  role?: string | null;
  admissionDate?: string | null;
}

export interface GetEmployeesPageParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

function buildEmployeeSearchWhere(search?: string) {
  return search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { pix: { contains: search, mode: "insensitive" as const } },
          { department: { contains: search, mode: "insensitive" as const } },
          { role: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
}

export async function getEmployeesPage({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetEmployeesPageParams = {}) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const where = buildEmployeeSearchWhere(search);
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, departments] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        select: { department: true },
        distinct: ["department"],
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
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

    return {
      success: true,
      data: employees,
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        departmentsCount: total === 0 ? 0 : departments.filter((d) => d.department).length || 1,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return { success: false, error: "Falha ao buscar colaboradores." };
  }
}

const fetchEmployeeOptions = unstable_cache(
  async () =>
    prisma.employee.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ["employee-options"],
  { tags: ["employees"] },
);

export async function getEmployeeOptions() {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const employees = await fetchEmployeeOptions();
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
    if (!employee) throw new EmployeeNotFoundError();
    return { success: true, data: employee };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao buscar colaborador:", error);
    return { success: false, error: "Falha ao buscar colaborador." };
  }
}

export async function createEmployee(input: EmployeeInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const name = assertValidEmployeeName(input.name);
    const pix = assertValidPixKey(input.pix);

    const employee = await prisma.employee.create({
      data: {
        name,
        pix,
        department: input.department?.trim() || null,
        role: input.role?.trim() || null,
        admissionDate: input.admissionDate ? new Date(input.admissionDate) : null,
      },
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

export async function updateEmployee(id: string, input: EmployeeInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const name = assertValidEmployeeName(input.name);
    const pix = assertValidPixKey(input.pix);

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        pix,
        department: input.department?.trim() || null,
        role: input.role?.trim() || null,
        admissionDate: input.admissionDate ? new Date(input.admissionDate) : null,
      },
    });

    revalidatePath("/colaboradores");
    updateTag("employees");
    return { success: true, data: employee };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
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
    updateTag("employees");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return { success: false, error: "Falha ao excluir colaborador." };
  }
}
