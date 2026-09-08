import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, FileSpreadsheet } from "lucide-react";

interface PrintAccountingToolbarProps {
  recordCount: number;
  onPrint: () => void;
}

export function PrintAccountingToolbar({ recordCount, onPrint }: PrintAccountingToolbarProps) {
  return (
    <div className="no-print sticky top-0 z-50 flex items-center justify-between border-b border-stone-800 bg-[#12100e]/95 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="text-stone-400 hover:text-stone-100"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-stone-200">
            Relatório para Contabilidade • {recordCount} colaborador(es) selecionado(s)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onPrint}
          className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20 px-4 h-9"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimir / Salvar em PDF
        </Button>
      </div>
    </div>
  );
}
