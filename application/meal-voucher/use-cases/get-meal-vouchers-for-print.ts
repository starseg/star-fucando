"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { IMealVoucherRepository } from "@/domain/meal-voucher/meal-voucher.repository.interface";
import { PrismaMealVoucherRepository } from "@/infrastructure/meal-voucher/prisma-meal-voucher.repository";
import { serializeVoucher } from "../meal-voucher-utils";

const repository: IMealVoucherRepository = new PrismaMealVoucherRepository();

export async function getMealVouchersForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const vouchers = await repository.findMealVouchersByIds(ids);
    return {
      success: true,
      data: vouchers.map((v) => serializeVoucher(v)),
    };
  } catch (error) {
    console.error("Erro ao buscar vales alimentação para impressão:", error);
    return { success: false, error: "Falha ao buscar vales para impressão." };
  }
}
