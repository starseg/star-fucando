import type { AttendanceAwardType } from "@prisma/client";

export const FULL_ATTENDANCE_BONUS_VALUE = 300;

export function suggestAttendanceBonusType(bonusValue: number): AttendanceAwardType {
  return bonusValue >= FULL_ATTENDANCE_BONUS_VALUE ? "INTEGRAL" : "PARCIAL";
}
