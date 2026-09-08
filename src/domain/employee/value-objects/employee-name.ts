import { InvalidEmployeeNameError } from "@/domain/employee/errors/employee-errors";

export function sanitizeEmployeeName(value: string): string {
  return value.trim();
}

export function assertValidEmployeeName(value: string): string {
  const sanitized = sanitizeEmployeeName(value);
  if (sanitized === "") {
    throw new InvalidEmployeeNameError();
  }
  return sanitized;
}
