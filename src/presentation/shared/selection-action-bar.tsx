"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface SelectionActionBarProps {
  selectedCount: number;
  totalCount: number;
  onPrint: () => void;
  onPrintAccounting?: () => void;
  onClear: () => void;
  benefitType: "Vale Transporte" | "Vale Alimentação" | "Prêmio de Assiduidade" | "Comissão";
}

export function SelectionActionBar({
  selectedCount,
  totalCount,
  onPrint,
  onPrintAccounting,
  onClear,
  benefitType,
}: SelectionActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-6 z-40 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-[#171513]/95 px-5 py-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 font-bold text-xs text-stone-950">
          {selectedCount}
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-100">
            {selectedCount === 1 ? "1 colaborador selecionado" : `${selectedCount} colaboradores selecionados`}
          </p>
          <p className="text-[11px] text-stone-400">
            Pronto para emissão de {benefitType}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 text-xs text-stone-400 hover:text-stone-100"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpar
        </Button>
        {onPrintAccounting && (
          <Button
            onClick={onPrintAccounting}
            size="sm"
            variant="outline"
            className="h-8 border-stone-700 bg-stone-900/80 text-stone-200 hover:bg-stone-800 hover:text-stone-100 font-semibold px-3 text-xs"
            title="Imprimir relatório em formato de tabela para a contabilidade"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
            Imprimir p/ Contabilidade
          </Button>
        )}
        <Button
          onClick={onPrint}
          size="sm"
          className="h-8 bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 px-3.5 text-xs"
          title="Imprimir recibos individuais assináveis"
        >
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Imprimir Recibos
        </Button>
      </div>
    </div>
  );
}
