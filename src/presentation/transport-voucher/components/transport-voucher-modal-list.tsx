import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { TransportVoucherModalRow } from "./transport-voucher-modal-row";
import { useTransportVoucherDialogContext } from "./transport-voucher-dialog-context";

export function TransportVoucherModalList() {
  const { modalDrafts, formState } = useTransportVoucherDialogContext();

  const handleWorkingDaysChange = (daysVal: string) => {
    formState.setWorkingDays(daysVal);
    modalDrafts.syncWorkingDays(daysVal);
  };

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
            value={formState.workingDays}
            onChange={(e) => handleWorkingDaysChange(e.target.value)}
            className="bg-stone-950 border-stone-700 text-stone-100 h-7 w-16 text-center text-xs font-bold rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {modalDrafts.drafts.map((draft) => (
          <TransportVoucherModalRow
            key={draft.key}
            draft={draft}
            canRemove={modalDrafts.drafts.length > 1}
          />
        ))}
      </div>

      <div className="pt-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => modalDrafts.addExtraModal(formState.workingDays)}
          className="h-7 text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Adicionar Transporte Extra (Van, Metrô, Integração...)
        </Button>
      </div>
    </div>
  );
}
