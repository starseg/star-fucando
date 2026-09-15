"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeRequiredError } from "@/domain/shared/errors/employee-required-error";
import { ReferenceMonthRequiredError } from "@/domain/shared/errors/reference-month-required-error";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaAttendanceAwardRepository } from "@/infrastructure/attendance-award/prisma-attendance-award.repository";
import { IAttendanceAwardRepository } from "@/domain/attendance-award/attendance-award.repository.interface";
import { AttendanceAwardInput } from "../attendance-award-dto";

const repository: IAttendanceAwardRepository = new PrismaAttendanceAwardRepository();

function serializeAward<T extends { bonusValue: unknown }>(award: T) {
  return { ...award, bonusValue: toPlainMoney(award.bonusValue) };
}

export async function upsertAttendanceAward(input: AttendanceAwardInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) throw new EmployeeRequiredError();
    if (!input.referenceMonth) throw new ReferenceMonthRequiredError();

    const recordInput = {
      employeeId: input.employeeId,
      referenceMonth: new Date(input.referenceMonth),
      bonusValue: input.bonusValue,
      bonusType: input.bonusType,
    };

    const award = input.id
      ? await repository.updateAttendanceAwardRecord(input.id, recordInput)
      : await repository.createAttendanceAwardRecord(recordInput);

    revalidatePath("/assiduidade");
    return { success: true, data: serializeAward(award) };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao salvar prêmio de assiduidade:", error);
    return { success: false, error: "Falha ao salvar prêmio de assiduidade." };
  }
}
