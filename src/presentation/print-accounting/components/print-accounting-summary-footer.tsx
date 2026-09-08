import * as React from "react";

interface PrintAccountingSummaryFooterProps {
  recordCount: number;
}

export function PrintAccountingSummaryFooter({ recordCount }: PrintAccountingSummaryFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-400">
      <span>
        Total de registros: <strong className="text-stone-200">{recordCount} colaboradores</strong>
      </span>
      <span>
        Relatório gerado em: <strong className="text-stone-200">{new Date().toLocaleDateString("pt-BR")}</strong>
      </span>
    </div>
  );
}
