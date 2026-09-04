"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { IEmployeeRepository } from "@/domain/employee/employee.repository.interface";
import { PrismaEmployeeRepository } from "@/infrastructure/employee/prisma-employee.repository";
import { GetEmployeesPageParams } from "@/application/employee/employee-dto";

const repository: IEmployeeRepository = new PrismaEmployeeRepository();

const DEFAULT_PAGE_SIZE = 20;

export async function getEmployeesPage({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetEmployeesPageParams = {}) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, departments] = await Promise.all([
      repository.countEmployees(search),
      repository.findEmployeeDepartments(search),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const employees = await repository.findEmployeesPage({ search, page: currentPage, pageSize });

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
