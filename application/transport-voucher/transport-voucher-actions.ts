"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { Prisma } from "@prisma/client";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney, toNullablePlainMoney } from "@/domain/shared/value-objects/money";
import { recalculateModals } from "@/domain/transport-voucher/value-objects/transport-modal-calculator";
import { DuplicateTransportVoucherError } from "@/domain/transport-voucher/errors/transport-voucher-errors";
import { transportVoucherSchema, formatZodError } from "./transport-voucher.schema";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();

export interface TransportModalInput {
  id?: string;
  name: string;
  unitValue: number;
  quantity: number;
  subtotal: number;
}

export interface TransportVoucherInput {
  id?: string;
  employeeId: string;
  referenceMonth: string; // "YYYY-MM-DD"
  inboundValue: number;
  outboundValue: number;
  weekendHolidayValue?: number | null;
  workingDays: number;
  weekendHolidayDays?: number;
  nightJokerIndicator?: boolean;
  totalVouchers: number;
  totalValue: number;
  discountPercentage?: number | null;
  observations?: string | null;
  modals: TransportModalInput[];
}

export interface GetTransportVouchersPageParams {
  search?: string;
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

interface SerializedTransportModal {
  id: string;
  name: string;
  unitValue: number;
  quantity: number;
  subtotal: number;
}

interface SerializedTransportVoucherFields {
  workingDays: number;
  totalVouchers: number;
  inboundValue: number;
  outboundValue: number;
  weekendHolidayValue: number | null;
  totalValue: number;
  discountPercentage: number | null;
  modals: SerializedTransportModal[];
}

function serializeVoucher<
  T extends {
    workingDays: unknown;
    totalVouchers: unknown;
    inboundValue: unknown;
    outboundValue: unknown;
    weekendHolidayValue: unknown;
    totalValue: unknown;
    discountPercentage: unknown;
    modals: { id: string; name: string; quantity: unknown; unitValue: unknown; subtotal: unknown }[];
  }
>(v: T): Omit<T, keyof SerializedTransportVoucherFields> & SerializedTransportVoucherFields {
  return {
    ...v,
    workingDays: Number(v.workingDays),
    totalVouchers: Number(v.totalVouchers),
    inboundValue: toPlainMoney(v.inboundValue),
    outboundValue: toPlainMoney(v.outboundValue),
    weekendHolidayValue: toNullablePlainMoney(v.weekendHolidayValue),
    totalValue: toPlainMoney(v.totalValue),
    discountPercentage: toNullablePlainMoney(v.discountPercentage),
    modals: v.modals.map((m) => ({
      id: m.id,
      name: m.name,
      quantity: Number(m.quantity),
      unitValue: toPlainMoney(m.unitValue),
      subtotal: toPlainMoney(m.subtotal),
    })),
  };
}

export async function getTransportVouchersPage({
  search,
  month,
  year,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: GetTransportVouchersPageParams) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const { start, end } = toReferenceMonthRange(month, year);
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      repository.countTransportVouchersInRange(search, start, end),
      repository.sumTransportVouchersInRange(search, start, end),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const vouchers = await repository.findTransportVouchersPage({ search, start, end, page: currentPage, pageSize });

    return {
      success: true,
      data: vouchers.map((v) => serializeVoucher(v)),
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        totalValueSum: toPlainMoney(aggregate._sum.totalValue ?? 0),
        employeesCount: total,
        totalVouchersCount: aggregate._sum.totalVouchers ?? 0,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar vales transporte:", error);
    return { success: false, error: "Falha ao buscar vales transporte." };
  }
}

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

export async function deleteTransportVoucher(id: string) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await repository.deleteTransportVoucherCascade(id);

    revalidatePath("/vale-transporte");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir vale transporte:", error);
    return { success: false, error: "Falha ao excluir vale transporte." };
  }
}

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
    console.error("Erro ao buscar vales transporte para impressão:", error);
    return { success: false, error: "Falha ao buscar vales para impressão." };
  }
}

export async function copyTransportVouchers(
  sourceMonth: number,
  sourceYear: number,
  targetMonth: number,
  targetYear: number
) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    assertDifferentReferenceMonth(sourceMonth, sourceYear, targetMonth, targetYear);

    const { start: srcStart, end: srcEnd } = toReferenceMonthRange(sourceMonth, sourceYear);
    const { start: targetStart, end: targetEnd } = toReferenceMonthRange(targetMonth, targetYear);

    const sourceVouchers = await repository.findTransportVouchersInRange(srcStart, srcEnd);

    if (sourceVouchers.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await repository.replaceTransportVouchersInRange(targetStart, targetEnd, sourceVouchers);

    revalidatePath("/vale-transporte");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar vales transporte:", error);
    return { success: false, error: "Falha ao copiar vales transporte do mês anterior." };
  }
}
