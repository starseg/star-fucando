import * as React from "react";
import { formatCurrency } from "@/lib/utils";

interface TransportVoucherTotalsSummaryProps {
  totalVouchers: number;
  totalValue: number;
}

export function TransportVoucherTotalsSummary({ totalVouchers, totalValue }: TransportVoucherTotalsSummaryProps) {
  return (
    <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex items-center justify-between">
      <div>
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
          Total de Passagens
        </span>
        <span className="text-xl font-bold text-stone-100">{totalVouchers} vales</span>
      </div>
      <div className="text-right">
        <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider block">
          Valor Total do Recibo
        </span>
        <span className="text-2xl font-black text-amber-400">{formatCurrency(totalValue)}</span>
      </div>
    </div>
  );
}
