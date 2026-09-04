"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { Prisma } from "@prisma/client";
import { recalculateModals } from "@/domain/transport-voucher/value-objects/transport-modal-calculator";
import { DuplicateTransportVoucherError } from "@/domain/transport-voucher/errors/transport-voucher-errors";
import { transportVoucherSchema, formatZodError } from "../transport-voucher.schema";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";
import { TransportVoucherInput, serializeVoucher } from "../transport-voucher-dto";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();

export async function upsertTransportVoucher(input: TransportVoucherInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = transportVoucherSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const refDate = new Date(parsed.data.referenceMonth);
    const { recalculated, totalVouchers, totalValue, inboundValue, outboundValue } =
      recalculateModals(parsed.data.modals);

    const fields = {
      employeeId: parsed.data.employeeId,
      referenceMonth: refDate,
      inboundValue,
      outboundValue,
      weekendHolidayValue: parsed.data.weekendHolidayValue,
      workingDays: parsed.data.workingDays,
      weekendHolidayDays: parsed.data.weekendHolidayDays,
      nightJokerIndicator: parsed.data.nightJokerIndicator,
      totalVouchers,
      totalValue,
      discountPercentage: parsed.data.discountPercentage,
      observations: parsed.data.observations?.trim() || null,
    };

    const voucher = input.id
      ? await repository.updateTransportVoucherWithModals(input.id, fields, recalculated)
      : await repository.createTransportVoucherWithModals(fields, recalculated);

    revalidatePath("/vale-transporte");
    return { success: true, data: serializeVoucher(voucher) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: new DuplicateTransportVoucherError().message };
    }
    console.error("Erro ao salvar vale transporte:", error);
    return { success: false, error: "Falha ao salvar vale transporte." };
  }
}
