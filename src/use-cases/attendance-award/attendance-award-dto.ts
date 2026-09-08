export interface AttendanceAwardInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  bonusValue: number;
}

export interface GetAttendanceAwardsPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}
