"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";
import { Prisma } from "@prisma/client";
import { z } from "zod";

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

function recalculateModals(modals: z.infer<typeof transportModalSchema>[]) {
  const recalculated = modals.map((m) => ({
    id: m.id,
    name: m.name,
    unitValue: m.unitValue,
    quantity: m.quantity,
    subtotal: Number((m.quantity * m.unitValue).toFixed(2)),
  }));

  const totalVouchers = recalculated.reduce((sum, m) => sum + m.quantity, 0);
  const totalValue = Number(
    recalculated.reduce((sum, m) => sum + m.subtotal, 0).toFixed(2)
  );

  let inboundModal = recalculated.find((m) => m.name.toLowerCase().includes("ida"));
  let outboundModal = recalculated.find((m) => m.name.toLowerCase().includes("volta"));

  if (!inboundModal && !outboundModal) {
    inboundModal = recalculated[0];
    outboundModal = recalculated[1];
  } else if (!inboundModal) {
    inboundModal = recalculated.find((m) => m !== outboundModal);
  } else if (!outboundModal) {
    outboundModal = recalculated.find((m) => m !== inboundModal);
  }

  const inboundValue = inboundModal?.unitValue ?? 0;
  const outboundValue = recalculated.length > 1 ? outboundModal?.unitValue ?? 0 : 0;

  return { recalculated, totalVouchers, totalValue, inboundValue, outboundValue };
}

export async function getTransportVouchers(month: number, year: number) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const vouchers = await prisma.transportVoucher.findMany({
      where: {
        referenceMonth: {
          gte: startDate,
          lt: endDate,
        },
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
      return {
        success: false,
        error: "Já existe um lançamento de Vale Transporte para este colaborador neste mês.",
      };
    }
    console.error("Erro ao salvar vale transporte:", error);
    return { success: false, error: "Falha ao salvar vale transporte." };
  }
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
    modals: { quantity: unknown; unitValue: unknown; subtotal: unknown }[];
  }
>(v: T) {
  return {
    ...v,
    workingDays: Number(v.workingDays),
    totalVouchers: Number(v.totalVouchers),
    inboundValue: Number(v.inboundValue),
    outboundValue: Number(v.outboundValue),
    weekendHolidayValue:
      v.weekendHolidayValue != null ? Number(v.weekendHolidayValue) : null,
    totalValue: Number(v.totalValue),
    discountPercentage:
      v.discountPercentage != null ? Number(v.discountPercentage) : null,
    modals: v.modals.map((m) => ({
      ...m,
      quantity: Number(m.quantity),
      unitValue: Number(m.unitValue),
      subtotal: Number(m.subtotal),
    })),
  };
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

  if (sourceMonth === targetMonth && sourceYear === targetYear) {
    return { success: false, error: "O mês de origem não pode ser igual ao mês de destino." };
  }

  try {
    const srcStartDate = new Date(Date.UTC(sourceYear, sourceMonth - 1, 1));
    const srcEndDate = new Date(Date.UTC(sourceYear, sourceMonth, 1));
    const targetRefDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const targetEndDate = new Date(Date.UTC(targetYear, targetMonth, 1));

    const sourceVouchers = await prisma.transportVoucher.findMany({
      where: {
        referenceMonth: {
          gte: srcStartDate,
          lt: srcEndDate,
        },
      },
      include: {
        modals: true,
      },
    });

    if (sourceVouchers.length === 0) {
      return {
        success: false,
        error: "Nenhum lançamento encontrado no mês de origem para copiar.",
      };
    }

    const createdCount = await prisma.$transaction(async (tx) => {
      const existing = await tx.transportVoucher.findMany({
        where: {
          referenceMonth: {
            gte: targetRefDate,
            lt: targetEndDate,
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
            referenceMonth: targetRefDate,
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
    console.error("Erro ao copiar vales transporte:", error);
    return { success: false, error: "Falha ao copiar vales transporte do mês anterior." };
  }
}
