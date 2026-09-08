import type { DataTableAccentColor } from "@/presentation/shared/data-table";

export interface CopyPreviousMonthConfig {
  benefitTitle: string;
  accentColor: DataTableAccentColor;
  onCopy: (
    sourceMonth: number,
    sourceYear: number,
    targetMonth: number,
    targetYear: number
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
}
