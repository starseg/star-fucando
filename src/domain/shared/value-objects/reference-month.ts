import { ReferenceMonthConflictError } from "@/domain/shared/errors/reference-month-conflict-error";

export interface ReferenceMonthRange {
  start: Date;
  end: Date;
}

export function toReferenceMonthDate(month: number, year: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

export function toReferenceMonthRange(month: number, year: number): ReferenceMonthRange {
  return {
    start: toReferenceMonthDate(month, year),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function isSameReferenceMonth(
  month: number,
  year: number,
  otherMonth: number,
  otherYear: number,
): boolean {
  return month === otherMonth && year === otherYear;
}

export function assertDifferentReferenceMonth(
  month: number,
  year: number,
  otherMonth: number,
  otherYear: number,
): void {
  if (isSameReferenceMonth(month, year, otherMonth, otherYear)) {
    throw new ReferenceMonthConflictError();
  }
}
