import type { Commission, Employee, Prisma } from "@prisma/client";

export interface CommissionPageParams {
  search?: string;
  start: Date;
  end: Date;
  page: number;
  pageSize: number;
}

export interface CommissionRecordInput {
  employeeId: string;
  referenceMonth: Date;
  commissionValue: number;
}

export type CommissionWithEmployee = Commission & { employee: Employee };

export interface ICommissionRepository {
  countCommissionsInRange(search: string | undefined, start: Date, end: Date): Promise<number>;
  sumCommissionsInRange(
    search: string | undefined,
    start: Date,
    end: Date
  ): Promise<{ _sum: { commissionValue: Prisma.Decimal | null } }>;
  findCommissionsPage(params: CommissionPageParams): Promise<CommissionWithEmployee[]>;
  createCommissionRecord(data: CommissionRecordInput): Promise<CommissionWithEmployee>;
  updateCommissionRecord(id: string, data: CommissionRecordInput): Promise<CommissionWithEmployee>;
  deleteCommissionRecord(id: string): Promise<Commission>;
  findCommissionsByIds(ids: string[]): Promise<CommissionWithEmployee[]>;
  findCommissionsInRange(start: Date, end: Date): Promise<Commission[]>;
  replaceCommissionsInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceCommissions: Commission[]
  ): Promise<number>;
}
