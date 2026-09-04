import { Employee } from "./entities/employee";

export interface EmployeeSearchParams {
  search?: string;
  page: number;
  pageSize: number;
}

export interface EmployeeRecordInput {
  name: string;
  pix: string;
  department: string | null;
  role: string | null;
  admissionDate: Date | null;
}

export interface EmployeeWithCounts extends Employee {
  _count: {
    transportVoucher: number;
    mealVoucher: number;
    attendanceAward: number;
  };
}

export interface IEmployeeRepository {
  countEmployees(search?: string): Promise<number>;
  findEmployeeDepartments(search?: string): Promise<{ department: string | null }[]>;
  findEmployeesPage(params: EmployeeSearchParams): Promise<EmployeeWithCounts[]>;
  findEmployeeOptions(): Promise<{ id: string; name: string }[]>;
  findEmployeeById(id: string): Promise<Employee | null>;
  createEmployeeRecord(data: EmployeeRecordInput): Promise<Employee>;
  updateEmployeeRecord(id: string, data: EmployeeRecordInput): Promise<Employee>;
  deleteEmployeeCascade(id: string): Promise<void>;
}
