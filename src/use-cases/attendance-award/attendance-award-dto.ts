import type { AttendanceAwardType } from "@prisma/client";

export interface AttendanceAwardInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  bonusValue: number;
  bonusType: AttendanceAwardType;
}

export interface GetAttendanceAwardsPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}
