export interface TransportVoucher {
  id: string;
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
