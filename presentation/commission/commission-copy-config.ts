import { copyCommissions } from "@/application/commission/use-cases/copy-commissions";
import type { CopyPreviousMonthConfig } from "@/presentation/shared/copy-previous-month/copy-previous-month.types";

export const commissionCopyConfig: CopyPreviousMonthConfig = {
  benefitTitle: "Comissão",
  accentColor: "violet",
  onCopy: copyCommissions,
};
