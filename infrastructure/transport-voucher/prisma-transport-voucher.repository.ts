import { prisma } from "@/infrastructure/db/prisma";
import type { TransportVoucher, TransportModal } from "@prisma/client";
import {
  ITransportVoucherRepository,
  TransportVoucherPageParams,
  TransportVoucherFieldsInput,
  RecalculatedModalInput,
} from "@/domain/transport-voucher/transport-voucher.repository.interface";

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

function buildTransportVoucherWhere(search: string | undefined, start: Date, end: Date) {
  return {
    referenceMonth: { gte: start, lt: end },
    ...buildTransportVoucherSearchWhere(search),
  };
}

export class PrismaTransportVoucherRepository implements ITransportVoucherRepository {
  async countTransportVouchersInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.transportVoucher.count({ where: buildTransportVoucherWhere(search, start, end) });
  }

  async sumTransportVouchersInRange(search: string | undefined, start: Date, end: Date) {
    return prisma.transportVoucher.aggregate({
      where: buildTransportVoucherWhere(search, start, end),
      _sum: { totalValue: true, totalVouchers: true },
    });
  }

  async findTransportVouchersPage({ search, start, end, page, pageSize }: TransportVoucherPageParams) {
    return prisma.transportVoucher.findMany({
      where: buildTransportVoucherWhere(search, start, end),
      include: { employee: true, modals: true },
      orderBy: { employee: { name: "asc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async createTransportVoucherWithModals(
    fields: TransportVoucherFieldsInput,
    modals: RecalculatedModalInput[]
  ) {
    return prisma.transportVoucher.create({
      data: {
        ...fields,
        modals: {
          create: modals.map((m) => ({
            name: m.name,
            unitValue: m.unitValue,
            quantity: m.quantity,
            subtotal: m.subtotal,
          })),
        },
      },
      include: { employee: true, modals: true },
    });
  }

  async updateTransportVoucherWithModals(
    id: string,
    fields: TransportVoucherFieldsInput,
    modals: RecalculatedModalInput[]
  ) {
    return prisma.$transaction(async (tx) => {
      const existingModals = await tx.transportModal.findMany({
        where: { transportVoucherId: id },
        select: { id: true },
      });
      const existingIds = new Set(existingModals.map((m) => m.id));
      const incomingIds = new Set(modals.filter((m) => m.id).map((m) => m.id as string));

      const idsToDelete = [...existingIds].filter((modalId) => !incomingIds.has(modalId));
      if (idsToDelete.length > 0) {
        await tx.transportModal.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      for (const m of modals) {
        if (m.id && existingIds.has(m.id)) {
          await tx.transportModal.update({
            where: { id: m.id },
            data: { name: m.name, unitValue: m.unitValue, quantity: m.quantity, subtotal: m.subtotal },
          });
        } else {
          await tx.transportModal.create({
            data: {
              transportVoucherId: id,
              name: m.name,
              unitValue: m.unitValue,
              quantity: m.quantity,
              subtotal: m.subtotal,
            },
          });
        }
      }

      return tx.transportVoucher.update({
        where: { id },
        data: fields,
        include: { employee: true, modals: true },
      });
    });
  }

  async deleteTransportVoucherCascade(id: string) {
    await prisma.transportModal.deleteMany({ where: { transportVoucherId: id } });
    await prisma.transportVoucher.delete({ where: { id } });
  }

  async findTransportVouchersByIds(ids: string[]) {
    return prisma.transportVoucher.findMany({
      where: { id: { in: ids } },
      include: { employee: true, modals: true },
      orderBy: { employee: { name: "asc" } },
    });
  }

  async findTransportVouchersInRange(start: Date, end: Date) {
    return prisma.transportVoucher.findMany({
      where: { referenceMonth: { gte: start, lt: end } },
      include: { modals: true },
    });
  }

  async replaceTransportVouchersInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceVouchers: (TransportVoucher & { modals: TransportModal[] })[]
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.transportVoucher.findMany({
        where: { referenceMonth: { gte: targetStart, lt: targetEnd } },
        select: { id: true },
      });

      const existingIds = existing.map((e) => e.id);
      if (existingIds.length > 0) {
        await tx.transportModal.deleteMany({ where: { transportVoucherId: { in: existingIds } } });
        await tx.transportVoucher.deleteMany({ where: { id: { in: existingIds } } });
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
  }
}
