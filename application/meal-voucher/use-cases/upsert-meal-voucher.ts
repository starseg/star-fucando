"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { EmployeeRequiredError } from "@/domain/shared/errors/employee-required-error";
import { ReferenceMonthRequiredError } from "@/domain/shared/errors/reference-month-required-error";
import { IMealVoucherRepository } from "@/domain/meal-voucher/meal-voucher.repository.interface";
import { PrismaMealVoucherRepository } from "@/infrastructure/meal-voucher/prisma-meal-voucher.repository";
import { MealVoucherInput } from "../meal-voucher-dto";
import { serializeVoucher } from "../meal-voucher-utils";

const repository: IMealVoucherRepository = new PrismaMealVoucherRepository();

export async function upsertMealVoucher(input: MealVoucherInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) throw new EmployeeRequiredError();
    if (!input.referenceMonth) throw new ReferenceMonthRequiredError();

    const recordInput = {
      employeeId: input.employeeId,
      referenceMonth: new Date(input.referenceMonth),
      unitValue: input.unitValue,
      workedDays: input.workedDays,
      voucherCount: input.voucherCount,
      totalValue: input.totalValue,
      discounts: input.discounts ?? 0,
    };

    const voucher = input.id
      ? await repository.updateMealVoucherRecord(input.id, recordInput)
      : await repository.createMealVoucherRecord(recordInput);

    revalidatePath("/vale-alimentacao");
    return { success: true, data: serializeVoucher(voucher) };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao salvar vale alimentação:", error);
    return { success: false, error: "Falha ao salvar vale alimentação." };
  }
}
