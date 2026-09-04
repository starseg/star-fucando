import { toPlainMoney, toNullablePlainMoney } from "@/domain/shared/value-objects/money";

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

export function serializeVoucher<
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
