"use server";

import { prisma } from "@/infrastructure/db/prisma";
import { revalidatePath } from "next/cache";
import { requireApprovedUser } from "@/application/auth/auth-guard";

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
      data: vouchers.map((v) => ({
        ...v,
        workingDays: Number(v.workingDays),
        totalVouchers: Number(v.totalVouchers),
        inboundValue: Number(v.inboundValue),
        outboundValue: Number(v.outboundValue),
        weekendHolidayValue: v.weekendHolidayValue ? Number(v.weekendHolidayValue) : null,
        totalValue: Number(v.totalValue),
        discountPercentage: v.discountPercentage ? Number(v.discountPercentage) : null,
        modals: v.modals.map((m) => ({
          ...m,
          quantity: Number(m.quantity),
          unitValue: Number(m.unitValue),
          subtotal: Number(m.subtotal),
        })),
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar vales transporte:", error);
    return { success: false, error: "Falha ao buscar vales transporte." };
  }
}

export async function upsertTransportVoucher(input: TransportVoucherInput) {
  const guard = await requireApprovedUser();
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    if (!input.employeeId) {
      return { success: false, error: "Colaborador é obrigatório." };
    }
    if (!input.referenceMonth) {
      return { success: false, error: "Mês de referência é obrigatório." };
    }

    const refDate = new Date(input.referenceMonth);

    // Se tiver ID, atualizamos
    if (input.id) {
      const voucher = await prisma.$transaction(async (tx) => {
        // Remove os modais existentes
        await tx.transportModal.deleteMany({
          where: { transportVoucherId: input.id },
        });

        // Atualiza o voucher e cria os novos modais
        return await tx.transportVoucher.update({
          where: { id: input.id },
          data: {
            employeeId: input.employeeId,
            referenceMonth: refDate,
            inboundValue: input.inboundValue,
            outboundValue: input.outboundValue,
            weekendHolidayValue: input.weekendHolidayValue ?? null,
            workingDays: input.workingDays,
            weekendHolidayDays: input.weekendHolidayDays ?? 0,
            nightJokerIndicator: input.nightJokerIndicator ?? false,
            totalVouchers: input.totalVouchers,
            totalValue: input.totalValue,
            discountPercentage: input.discountPercentage ?? null,
            observations: input.observations?.trim() || null,
            modals: {
              create: input.modals.map((m) => ({
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
      });

      revalidatePath("/vale-transporte");
      return { success: true, data: voucher };
    }

    // Caso contrário, criamos um novo
    const voucher = await prisma.transportVoucher.create({
      data: {
        employeeId: input.employeeId,
        referenceMonth: refDate,
        inboundValue: input.inboundValue,
        outboundValue: input.outboundValue,
        weekendHolidayValue: input.weekendHolidayValue ?? null,
        workingDays: input.workingDays,
        weekendHolidayDays: input.weekendHolidayDays ?? 0,
        nightJokerIndicator: input.nightJokerIndicator ?? false,
        totalVouchers: input.totalVouchers,
        totalValue: input.totalValue,
        discountPercentage: input.discountPercentage ?? null,
        observations: input.observations?.trim() || null,
        modals: {
          create: input.modals.map((m) => ({
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
    return { success: true, data: voucher };
  } catch (error) {
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
      data: vouchers.map((v) => ({
        ...v,
        workingDays: Number(v.workingDays),
        totalVouchers: Number(v.totalVouchers),
        inboundValue: Number(v.inboundValue),
        outboundValue: Number(v.outboundValue),
        weekendHolidayValue: v.weekendHolidayValue ? Number(v.weekendHolidayValue) : null,
        totalValue: Number(v.totalValue),
        discountPercentage: v.discountPercentage ? Number(v.discountPercentage) : null,
        modals: v.modals.map((m) => ({
          ...m,
          quantity: Number(m.quantity),
          unitValue: Number(m.unitValue),
          subtotal: Number(m.subtotal),
        })),
      })),
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
