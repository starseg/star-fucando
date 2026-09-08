"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { Prisma } from "@prisma/client";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeRequiredError } from "@/domain/shared/errors/employee-required-error";
import { ReferenceMonthRequiredError } from "@/domain/shared/errors/reference-month-required-error";
import { DuplicateCommissionError } from "@/domain/commission/errors/commission-errors";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { PrismaCommissionRepository } from "@/infrastructure/commission/prisma-commission.repository";
import { ICommissionRepository } from "@/domain/commission/commission.repository.interface";
import { CommissionInput } from "../commission-dto";

const repository: ICommissionRepository = new PrismaCommissionRepository();

function serializeCommission<T extends { commissionValue: unknown }>(commission: T) {
  return { ...commission, commissionValue: toPlainMoney(commission.commissionValue) };
}

export async function upsertCommission(input: CommissionInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) throw new EmployeeRequiredError();
    if (!input.referenceMonth) throw new ReferenceMonthRequiredError();

    const recordInput = {
      employeeId: input.employeeId,
      referenceMonth: new Date(input.referenceMonth),
      commissionValue: input.commissionValue,
    };

    const commission = input.id
      ? await repository.updateCommissionRecord(input.id, recordInput)
      : await repository.createCommissionRecord(recordInput);

    revalidatePath("/comissoes");
    return { success: true, data: serializeCommission(commission) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: new DuplicateCommissionError().message };
    }
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao salvar comissão:", error);
    return { success: false, error: "Falha ao salvar comissão." };
  }
}
