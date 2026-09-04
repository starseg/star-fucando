import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { TransportVoucherModalRow } from "./transport-voucher-modal-row";
import type { ModalDraft } from "../hooks/use-transport-voucher-modal-drafts";

interface TransportVoucherModalListProps {
  drafts: ModalDraft[];
  workingDays: number | string;
  onWorkingDaysChange: (value: string) => void;
  onUpdateText: (key: string, field: "name" | "unitValueText", value: string) => void;
  onUpdateQuantity: (key: string, value: string) => void;
  onRemove: (key: string) => void;
  onAddExtra: () => void;
}

export function TransportVoucherModalList({
  drafts,
  workingDays,
  onWorkingDaysChange,
  onUpdateText,
  onUpdateQuantity,
  onRemove,
  onAddExtra,
}: TransportVoucherModalListProps) {
  return (
    <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Modais de Transporte & Quantidades
        </span>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-stone-400">Dias Úteis Padrão:</Label>
          <Input
            type="number"
            min="0"
            value={workingDays}
            onChange={(e) => onWorkingDaysChange(e.target.value)}
            className="bg-stone-950 border-stone-700 text-stone-100 h-7 w-16 text-center text-xs font-bold rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {drafts.map((draft) => (
          <TransportVoucherModalRow
            key={draft.key}
            draft={draft}
            canRemove={drafts.length > 1}
            onUpdateText={onUpdateText}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="pt-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddExtra}
          className="h-7 text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Adicionar Transporte Extra (Van, Metrô, Integração...)
        </Button>
      </div>
    </div>
  );
}
