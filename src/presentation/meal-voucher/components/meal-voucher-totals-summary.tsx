import * as React from "react";
import { formatCurrency } from "@/lib/utils";

interface MealVoucherTotalsSummaryProps {
  workedDays: number;
  grossValue: number;
  netValue: number;
}

export function MealVoucherTotalsSummary({
  workedDays,
  grossValue,
  netValue,
}: MealVoucherTotalsSummaryProps) {
  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
          Total Bruto ({workedDays} dias)
        </span>
        <span className="text-sm font-semibold text-stone-200">{formatCurrency(grossValue)}</span>
      </div>
      <div className="text-right">
        <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block">
          Líquido a Pagar
        </span>
        <span className="text-2xl font-black text-emerald-400">{formatCurrency(netValue)}</span>
      </div>
    </div>
  );
}
