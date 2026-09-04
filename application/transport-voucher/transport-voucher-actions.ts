"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { NoEntriesToCopyError } from "@/domain/shared/errors/no-entries-to-copy-error";
import { assertDifferentReferenceMonth, toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney, toNullablePlainMoney } from "@/domain/shared/value-objects/money";
import { recalculateModals } from "@/domain/transport-voucher/value-objects/transport-modal-calculator";
import { DuplicateTransportVoucherError } from "@/domain/transport-voucher/errors/transport-voucher-errors";

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

const transportModalSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Nome do modal é obrigatório."),
  unitValue: z.coerce.number().positive("Valor unitário deve ser maior que zero."),
  quantity: z.coerce.number().int().min(1, "Quantidade deve ser maior ou igual a 1."),
});

const transportVoucherSchema = z.object({
  employeeId: z.string().trim().min(1, "Colaborador é obrigatório."),
  referenceMonth: z.string().trim().min(1, "Mês de referência é obrigatório."),
  workingDays: z.coerce.number().int().min(0, "Dias úteis não pode ser negativo."),
  weekendHolidayDays: z.coerce.number().int().min(0).optional().default(0),
  weekendHolidayValue: z.coerce.number().min(0).nullable().optional().default(null),
  nightJokerIndicator: z.coerce.boolean().optional().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).nullable().optional().default(null),
  observations: z.string().nullable().optional(),
  modals: z.array(transportModalSchema).min(1, "Adicione pelo menos um modal."),
});

function formatZodError(error: z.ZodError): string {
  const messages = error.issues.map((issue) => issue.message);
  return messages.length > 0
    ? messages.join(" ")
    : "Dados inválidos para o vale transporte.";
}

function buildTransportVoucherSearchWhere(search?: string) {
  return search
    ? {
        employee: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { department: { contains: search, mode: "insensitive" as const } },
            { role: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }
    : {};
}

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
    const where = {
      referenceMonth: { gte: start, lt: end },
      ...buildTransportVoucherSearchWhere(search),
    };
    const requestedPage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : 1;

    const [total, aggregate] = await Promise.all([
      prisma.transportVoucher.count({ where }),
      prisma.transportVoucher.aggregate({
        where,
        _sum: { totalValue: true, totalVouchers: true },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);

    const vouchers = await prisma.transportVoucher.findMany({
      where,
      include: {
        employee: true,
        modals: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

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

    // Se tiver ID, atualizamos
    if (input.id) {
      const voucher = await prisma.$transaction(async (tx) => {
        const existingModals = await tx.transportModal.findMany({
          where: { transportVoucherId: input.id },
          select: { id: true },
        });
        const existingIds = new Set(existingModals.map((m) => m.id));
        const incomingIds = new Set(
          recalculated.filter((m) => m.id).map((m) => m.id as string)
        );

        const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if (idsToDelete.length > 0) {
          await tx.transportModal.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const m of recalculated) {
          if (m.id && existingIds.has(m.id)) {
            await tx.transportModal.update({
              where: { id: m.id },
              data: {
                name: m.name,
                unitValue: m.unitValue,
                quantity: m.quantity,
                subtotal: m.subtotal,
              },
            });
          } else {
            await tx.transportModal.create({
              data: {
                transportVoucherId: input.id as string,
                name: m.name,
                unitValue: m.unitValue,
                quantity: m.quantity,
                subtotal: m.subtotal,
              },
            });
          }
        }

        return await tx.transportVoucher.update({
          where: { id: input.id },
          data: {
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
          },
          include: {
            employee: true,
            modals: true,
          },
        });
      });

      revalidatePath("/vale-transporte");
      return { success: true, data: serializeVoucher(voucher) };
    }

    // Caso contrário, criamos um novo
    const voucher = await prisma.transportVoucher.create({
      data: {
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
        modals: {
          create: recalculated.map((m) => ({
            name: m.name,
            unitValue: m.unitValue,
            quantity: m.quantity,
            subtotal: m.subtotal,
          })),
        },
      },
      include: {
        employee: true,
        modals: true,
      },
    });

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
    await prisma.transportModal.deleteMany({ where: { transportVoucherId: id } });
    await prisma.transportVoucher.delete({ where: { id } });

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
    const vouchers = await prisma.transportVoucher.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        employee: true,
        modals: true,
      },
      orderBy: {
        employee: {
          name: "asc",
        },
      },
    });

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

    const sourceVouchers = await prisma.transportVoucher.findMany({
      where: {
        referenceMonth: {
          gte: srcStart,
          lt: srcEnd,
        },
      },
      include: {
        modals: true,
      },
    });

    if (sourceVouchers.length === 0) throw new NoEntriesToCopyError();

    const createdCount = await prisma.$transaction(async (tx) => {
      const existing = await tx.transportVoucher.findMany({
        where: {
          referenceMonth: {
            gte: targetStart,
            lt: targetEnd,
          },
        },
        select: { id: true },
      });

      const existingIds = existing.map((e) => e.id);
      if (existingIds.length > 0) {
        await tx.transportModal.deleteMany({
          where: { transportVoucherId: { in: existingIds } },
        });
        await tx.transportVoucher.deleteMany({
          where: { id: { in: existingIds } },
        });
      }

      for (const v of sourceVouchers) {
        await tx.transportVoucher.create({
          data: {
            employeeId: v.employeeId,
            referenceMonth: targetStart,
            inboundValue: v.inboundValue,
            outboundValue: v.outboundValue,
            weekendHolidayValue: v.weekendHolidayValue,
            workingDays: v.workingDays,
            weekendHolidayDays: v.weekendHolidayDays,
            nightJokerIndicator: v.nightJokerIndicator,
            totalVouchers: v.totalVouchers,
            totalValue: v.totalValue,
            discountPercentage: v.discountPercentage,
            observations: v.observations,
            modals: {
              create: v.modals.map((m) => ({
                name: m.name,
                unitValue: m.unitValue,
                quantity: m.quantity,
                subtotal: m.subtotal,
              })),
            },
          },
        });
      }

      return sourceVouchers.length;
    });

    revalidatePath("/vale-transporte");
    return { success: true, count: createdCount };
  } catch (error) {
    if (error instanceof DomainError) return { success: false, error: error.message };
    console.error("Erro ao copiar vales transporte:", error);
    return { success: false, error: "Falha ao copiar vales transporte do mês anterior." };
  }
}
