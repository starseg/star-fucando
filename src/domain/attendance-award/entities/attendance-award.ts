import type { AttendanceAwardType } from "@prisma/client";

export interface AttendanceAward {
  id: string;
  employeeId: string;
  referenceMonth: Date;
  bonusValue: number;
  bonusType: AttendanceAwardType;
}
