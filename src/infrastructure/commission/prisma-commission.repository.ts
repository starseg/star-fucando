import { prisma } from "@/infrastructure/db/prisma";
import type { Commission } from "@prisma/client";
import {
  CommissionPageParams,
  CommissionRecordInput,
  ICommissionRepository,
} from "@/domain/commission/commission.repository.interface";

export class PrismaCommissionRepository implements ICommissionRepository {
  private buildCommissionSearchWhere(search?: string) {
    return search
      ? {
          employee: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { department: { contains: search, mode: "insensitive" as const } },
              { role: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {};
  }

  private buildCommissionWhere(search: string | undefined, start: Date, end: Date) {
    return {
      referenceMonth: { gte: start, lt: end },
      ...this.buildCommissionSearchWhere(search),
    };
  }

  async countCommissionsInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.commission.count({ where: this.buildCommissionWhere(search, start, end) });
  }

  async sumCommissionsInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.commission.aggregate({
      where: this.buildCommissionWhere(search, start, end),
      _sum: { commissionValue: true },
    });
  }

  async findCommissionsPage({ search, start, end, page, pageSize }: CommissionPageParams) {
    return prisma.commission.findMany({
      where: this.buildCommissionWhere(search, start, end),
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createCommissionRecord(data: CommissionRecordInput) {
    return prisma.commission.create({ data, include: { employee: true } });
  }

  async updateCommissionRecord(id: string, data: CommissionRecordInput) {
    return prisma.commission.update({ where: { id }, data, include: { employee: true } });
  }

  async deleteCommissionRecord(id: string) {
    return prisma.commission.delete({ where: { id } });
  }

  async findCommissionsByIds(ids: string[]) {
    return prisma.commission.findMany({
      where: { id: { in: ids } },
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
    });
  }

  async findCommissionsInRange(start: Date, end: Date) {
    return prisma.commission.findMany({ where: { referenceMonth: { gte: start, lt: end } } });
  }

  async replaceCommissionsInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceCommissions: Commission[]
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.commission.deleteMany({
        where: { referenceMonth: { gte: targetStart, lt: targetEnd } },
      });

      for (const c of sourceCommissions) {
        let newStartDate: Date;
        let newEndDate: Date;

        const tYear = targetStart.getUTCFullYear();
        const tMonth = targetStart.getUTCMonth();

        if (c.startDate && c.endDate) {
          const s = new Date(c.startDate);
          const e = new Date(c.endDate);
          const ref = new Date(c.referenceMonth);
          const monthDiff = (tYear - ref.getUTCFullYear()) * 12 + (tMonth - ref.getUTCMonth());

          newStartDate = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + monthDiff, s.getUTCDate()));
          newEndDate = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth() + monthDiff, e.getUTCDate()));
        } else {
          newStartDate = new Date(Date.UTC(tYear, tMonth - 1, 21));
          newEndDate = new Date(Date.UTC(tYear, tMonth, 20));
        }

        await tx.commission.create({
          data: {
            employeeId: c.employeeId,
            referenceMonth: targetStart,
            startDate: newStartDate,
            endDate: newEndDate,
            commissionValue: c.commissionValue,
          },
        });
      }

      return sourceCommissions.length;
    });
  }
}
