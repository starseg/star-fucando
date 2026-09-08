"use server";

import { requireApprovedUser } from "@/use-cases/auth/auth-guard";
import { toReferenceMonthRange } from "@/domain/shared/value-objects/reference-month";
import { toPlainMoney } from "@/domain/shared/value-objects/money";
import { ITransportVoucherRepository } from "@/domain/transport-voucher/transport-voucher.repository.interface";
import { PrismaTransportVoucherRepository } from "@/infrastructure/transport-voucher/prisma-transport-voucher.repository";
import { GetTransportVouchersPageParams, serializeVoucher } from "../transport-voucher-dto";

const repository: ITransportVoucherRepository = new PrismaTransportVoucherRepository();
const DEFAULT_PAGE_SIZE = 20;

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
