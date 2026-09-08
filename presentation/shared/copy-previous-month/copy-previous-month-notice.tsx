import * as React from "react";
import { MONTH_NAMES } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface CopyPreviousMonthNoticeProps {
  targetMonth: number;
  targetYear: number;
}

export function CopyPreviousMonthNotice({ targetMonth, targetYear }: CopyPreviousMonthNoticeProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-stone-900/60 border border-stone-800 p-3 text-xs text-stone-400 leading-relaxed">
      <AlertCircle className="h-4 w-4 text-stone-300 shrink-0 mt-0.5" />
      <span>
        Todos os colaboradores, valores e modais do mês de origem serão copiados para{" "}
        <strong className="text-stone-200">
          {MONTH_NAMES[targetMonth - 1]} de {targetYear}
        </strong>
        . Lançamentos existentes no mês de destino serão{" "}
        <strong className="text-stone-200">substituídos</strong>.
      </span>
    </div>
  );
}
