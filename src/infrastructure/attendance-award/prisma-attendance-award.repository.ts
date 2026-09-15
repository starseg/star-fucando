import { prisma } from "@/infrastructure/db/prisma";
import type { AttendanceAward } from "@prisma/client";
import {
  AttendanceAwardPageParams,
  AttendanceAwardRecordInput,
  IAttendanceAwardRepository,
} from "@/domain/attendance-award/attendance-award.repository.interface";

export class PrismaAttendanceAwardRepository implements IAttendanceAwardRepository {
  private buildAttendanceAwardSearchWhere(search?: string) {
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

  private buildAttendanceAwardWhere(search: string | undefined, start: Date, end: Date) {
    return {
      referenceMonth: { gte: start, lt: end },
      ...this.buildAttendanceAwardSearchWhere(search),
    };
  }

  async countAttendanceAwardsInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.attendanceAward.count({ where: this.buildAttendanceAwardWhere(search, start, end) });
  }

  async sumAttendanceAwardsInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.attendanceAward.aggregate({
      where: this.buildAttendanceAwardWhere(search, start, end),
      _sum: { bonusValue: true },
    });
  }

  async findAttendanceAwardsPage({ search, start, end, page, pageSize }: AttendanceAwardPageParams) {
    return prisma.attendanceAward.findMany({
      where: this.buildAttendanceAwardWhere(search, start, end),
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createAttendanceAwardRecord(data: AttendanceAwardRecordInput) {
    return prisma.attendanceAward.create({ data, include: { employee: true } });
  }

  async updateAttendanceAwardRecord(id: string, data: AttendanceAwardRecordInput) {
    return prisma.attendanceAward.update({ where: { id }, data, include: { employee: true } });
  }

  async deleteAttendanceAwardRecord(id: string) {
    return prisma.attendanceAward.delete({ where: { id } });
  }

  async findAttendanceAwardsByIds(ids: string[]) {
    return prisma.attendanceAward.findMany({
      where: { id: { in: ids } },
      include: { employee: true },
      orderBy: { employee: { name: "asc" } },
    });
  }

  async findAttendanceAwardsInRange(start: Date, end: Date) {
    return prisma.attendanceAward.findMany({ where: { referenceMonth: { gte: start, lt: end } } });
  }

  async replaceAttendanceAwardsInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceAwards: AttendanceAward[]
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.attendanceAward.deleteMany({
        where: { referenceMonth: { gte: targetStart, lt: targetEnd } },
      });

      for (const a of sourceAwards) {
        await tx.attendanceAward.create({
          data: {
            employeeId: a.employeeId,
            referenceMonth: targetStart,
            bonusValue: a.bonusValue,
            bonusType: a.bonusType,
          },
        });
      }

      return sourceAwards.length;
    });
  }
}
