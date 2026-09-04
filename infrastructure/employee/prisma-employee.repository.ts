import { prisma } from "@/infrastructure/db/prisma";
import { unstable_cache } from "next/cache";
import {
  IEmployeeRepository,
  EmployeeSearchParams,
  EmployeeRecordInput,
} from "@/domain/employee/employee.repository.interface";

export class PrismaEmployeeRepository implements IEmployeeRepository {
  private buildEmployeeSearchWhere(search?: string) {
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

  async countEmployees(search?: string) {
    return prisma.employee.count({ where: this.buildEmployeeSearchWhere(search) });
  }

  async findEmployeeDepartments(search?: string) {
    return prisma.employee.findMany({
      where: this.buildEmployeeSearchWhere(search),
      select: { department: true },
      distinct: ["department"],
    });
  }

  async findEmployeesPage({ search, page, pageSize }: EmployeeSearchParams) {
    return prisma.employee.findMany({
      where: this.buildEmployeeSearchWhere(search),
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
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
  }

  async findEmployeeOptions() {
    const cachedFn = unstable_cache(
      async () =>
        prisma.employee.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ["employee-options"],
      { tags: ["employees"] },
    );
    return cachedFn();
  }

  async findEmployeeById(id: string) {
    return prisma.employee.findUnique({ where: { id } });
  }

  async createEmployeeRecord(data: EmployeeRecordInput) {
    return prisma.employee.create({ data });
  }

  async updateEmployeeRecord(id: string, data: EmployeeRecordInput) {
    return prisma.employee.update({ where: { id }, data });
  }

  async deleteEmployeeCascade(id: string) {
    await prisma.transportModal.deleteMany({
      where: { transportVoucher: { employeeId: id } },
    });
    await prisma.transportVoucher.deleteMany({ where: { employeeId: id } });
    await prisma.mealVoucher.deleteMany({ where: { employeeId: id } });
    await prisma.attendanceAward.deleteMany({ where: { employeeId: id } });
    await prisma.employee.delete({ where: { id } });
  }
}
