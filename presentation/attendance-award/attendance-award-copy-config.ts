import { copyAttendanceAwards } from "@/application/attendance-award/use-cases/copy-attendance-awards";
import type { CopyPreviousMonthConfig } from "@/presentation/shared/copy-previous-month/copy-previous-month.types";

export const attendanceAwardCopyConfig: CopyPreviousMonthConfig = {
  benefitTitle: "Prêmio de Assiduidade",
  accentColor: "sky",
  onCopy: copyAttendanceAwards,
};
