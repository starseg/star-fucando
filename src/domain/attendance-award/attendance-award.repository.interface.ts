import type { AttendanceAward, Employee, Prisma } from "@prisma/client";

export interface AttendanceAwardPageParams {
  search?: string;
  start: Date;
  end: Date;
  page: number;
  pageSize: number;
}

export interface AttendanceAwardRecordInput {
  employeeId: string;
  referenceMonth: Date;
  bonusValue: number;
}

export type AttendanceAwardWithEmployee = AttendanceAward & { employee: Employee };

export interface IAttendanceAwardRepository {
  countAttendanceAwardsInRange(search: string | undefined, start: Date, end: Date): Promise<number>;
  sumAttendanceAwardsInRange(
    search: string | undefined,
    start: Date,
    end: Date
  ): Promise<{ _sum: { bonusValue: Prisma.Decimal | null } }>;
  findAttendanceAwardsPage(params: AttendanceAwardPageParams): Promise<AttendanceAwardWithEmployee[]>;
  createAttendanceAwardRecord(data: AttendanceAwardRecordInput): Promise<AttendanceAwardWithEmployee>;
  updateAttendanceAwardRecord(id: string, data: AttendanceAwardRecordInput): Promise<AttendanceAwardWithEmployee>;
  deleteAttendanceAwardRecord(id: string): Promise<AttendanceAward>;
  findAttendanceAwardsByIds(ids: string[]): Promise<AttendanceAwardWithEmployee[]>;
  findAttendanceAwardsInRange(start: Date, end: Date): Promise<AttendanceAward[]>;
  replaceAttendanceAwardsInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceAwards: AttendanceAward[]
  ): Promise<number>;
}
