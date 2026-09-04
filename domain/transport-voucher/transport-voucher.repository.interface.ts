import type { TransportVoucher, TransportModal, Employee } from "@prisma/client";

export interface TransportVoucherPageParams {
  search?: string;
  start: Date;
  end: Date;
  page: number;
  pageSize: number;
}

export interface TransportVoucherFieldsInput {
  employeeId: string;
  referenceMonth: Date;
  inboundValue: number;
  outboundValue: number;
  weekendHolidayValue: number | null;
  workingDays: number;
  weekendHolidayDays: number;
  nightJokerIndicator: boolean;
  totalVouchers: number;
  totalValue: number;
  discountPercentage: number | null;
  observations: string | null;
}

export interface RecalculatedModalInput {
  id?: string;
  name: string;
  unitValue: number;
  quantity: number;
  subtotal: number;
}

export interface ITransportVoucherRepository {
  countTransportVouchersInRange(search: string | undefined, start: Date, end: Date): Promise<number>;
  sumTransportVouchersInRange(search: string | undefined, start: Date, end: Date): Promise<{ _sum: { totalValue: number | null; totalVouchers: number | null } } | any>;
  findTransportVouchersPage(params: TransportVoucherPageParams): Promise<(TransportVoucher & { employee: Employee; modals: TransportModal[] })[]>;
  createTransportVoucherWithModals(
    fields: TransportVoucherFieldsInput,
    modals: RecalculatedModalInput[]
  ): Promise<TransportVoucher & { employee: Employee; modals: TransportModal[] }>;
  updateTransportVoucherWithModals(
    id: string,
    fields: TransportVoucherFieldsInput,
    modals: RecalculatedModalInput[]
  ): Promise<TransportVoucher & { employee: Employee; modals: TransportModal[] }>;
  deleteTransportVoucherCascade(id: string): Promise<void>;
  findTransportVouchersByIds(ids: string[]): Promise<(TransportVoucher & { employee: Employee; modals: TransportModal[] })[]>;
  findTransportVouchersInRange(start: Date, end: Date): Promise<(TransportVoucher & { modals: TransportModal[] })[]>;
  replaceTransportVouchersInRange(
    targetStart: Date,
    targetEnd: Date,
    sourceVouchers: (TransportVoucher & { modals: TransportModal[] })[]
  ): Promise<number>;
}
