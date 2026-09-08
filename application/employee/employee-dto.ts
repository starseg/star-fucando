export interface EmployeeInput {
  name: string;
  pix?: string | null;
  department?: string | null;
  role?: string | null;
  admissionDate?: string | null;
}

export interface GetEmployeesPageParams {
  search?: string;
  page?: number;
  pageSize?: number;
}
