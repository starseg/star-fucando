export interface CommissionInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  commissionValue: number;
}

export interface GetCommissionsPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}
