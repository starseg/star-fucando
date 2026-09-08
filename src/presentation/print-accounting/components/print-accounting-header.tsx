import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PrintAccountingHeaderProps {
  title: string;
  icon: LucideIcon;
  badgeColor: string;
  accentColor: string;
  totalValueSum: number;
  referenceDateFormatted: string;
}

export function PrintAccountingHeader({
  title,
  icon: Icon,
  badgeColor,
  accentColor,
  totalValueSum,
  referenceDateFormatted,
}: PrintAccountingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800/80">
      <div className="flex items-center gap-3.5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${badgeColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-stone-100 tracking-tight">{title}</h1>
            <span className="text-xs uppercase px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Contabilidade
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            STAR SEG • Relatório consolidado de pagamentos de benefícios com chave PIX
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        {referenceDateFormatted && (
          <div className="px-3.5 py-1.5 rounded-xl border border-stone-800 bg-stone-900/60">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Competência</span>
            <span className="text-xs font-semibold text-stone-200 capitalize">
              {referenceDateFormatted}
            </span>
          </div>
        )}
        <div className="px-3.5 py-1.5 rounded-xl border border-stone-800 bg-stone-900/60">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Consolidado</span>
          <span className={`text-sm font-black ${accentColor}`}>{formatCurrency(totalValueSum)}</span>
        </div>
      </div>
    </div>
  );
}
