"use server";

import { requireApprovedUser } from "@/application/auth/auth-guard";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";
import { serializeVoucher } from "../transport-voucher-dto";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();

export async function getTransportVouchersForPrint(ids: string[]) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const vouchers = await repository.findTransportVouchersByIds(ids);

    return {
      success: true,
      data: vouchers.map((v) => serializeVoucher(v)),
    };
  } catch (error) {
    console.error("Erro ao buscar vales transporte para impressuo:", error);
    return { success: false, error: "Falha ao buscar vales para impressuo." };
  }
}
