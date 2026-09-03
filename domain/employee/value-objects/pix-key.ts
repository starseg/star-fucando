import { InvalidEmployeePixError } from "@/domain/employee/errors/employee-errors";

export function sanitizePixKey(value: string): string {
  return value.trim();
}

export function assertValidPixKey(value: string): string {
  const sanitized = sanitizePixKey(value);
  if (sanitized === "") {
    throw new InvalidEmployeePixError();
  }
  return sanitized;
}
