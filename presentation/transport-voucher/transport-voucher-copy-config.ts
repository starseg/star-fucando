import { copyTransportVouchers } from "@/application/transport-voucher/use-cases/copy-transport-vouchers";
import type { CopyPreviousMonthConfig } from "@/presentation/shared/copy-previous-month/copy-previous-month.types";

export const transportVoucherCopyConfig: CopyPreviousMonthConfig = {
  benefitTitle: "Vale Transporte",
  accentColor: "amber",
  onCopy: copyTransportVouchers,
};
