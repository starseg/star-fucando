export interface CommissionInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  startDate?: string | null; // "YYYY-MM-DD"
  endDate?: string | null; // "YYYY-MM-DD"
  commissionValue: number;
}

export interface GetCommissionsPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}
