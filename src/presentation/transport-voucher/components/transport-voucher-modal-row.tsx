import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { parseDecimalInput, parseIntegerInput } from "@/lib/number";
import { rowSubtotal, type ModalDraft } from "../hooks/use-transport-voucher-modal-drafts";
import { useTransportVoucherDialogContext } from "./transport-voucher-dialog-context";

interface TransportVoucherModalRowProps {
  draft: ModalDraft;
  canRemove: boolean;
}

export function TransportVoucherModalRow({ draft, canRemove }: TransportVoucherModalRowProps) {
  const { modalDrafts } = useTransportVoucherDialogContext();
  const quantity = parseIntegerInput(draft.quantityText);
  const unitValue = parseDecimalInput(draft.unitValueText);
  const subtotal = rowSubtotal(draft);

  return (
    <div className="grid grid-cols-12 gap-2 items-center bg-stone-950/80 border border-stone-800/80 p-2.5 rounded-xl text-xs">
      <div className="col-span-4 space-y-0.5">
        <Label className="text-[10px] text-stone-400 font-medium">Transporte</Label>
        <Input
          placeholder="Ex: Ônibus, Van..."
          value={draft.name}
          onChange={(e) => modalDrafts.updateModalText(draft.key, "name", e.target.value)}
          className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg font-medium"
        />
      </div>

      <div className="col-span-3 space-y-0.5">
        <Label className="text-[10px] text-stone-400 font-medium">Tarifa Unit. (R$)</Label>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={draft.unitValueText}
          onChange={(e) => modalDrafts.updateModalText(draft.key, "unitValueText", e.target.value)}
          className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg text-right font-semibold"
        />
      </div>

      <div className="col-span-2 space-y-0.5">
        <Label className="text-[10px] text-stone-400 font-medium">Qtd Vales</Label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={draft.quantityText}
          onChange={(e) => modalDrafts.updateModalQuantity(draft.key, e.target.value)}
          className="bg-stone-900 border-stone-700/80 text-stone-100 h-7 text-xs rounded-lg text-center font-bold text-amber-300"
        />
      </div>

      <div className="col-span-2 space-y-0.5 text-right">
        <Label className="text-[10px] text-stone-400 font-medium">Subtotal</Label>
        <div className="h-7 flex flex-col items-end justify-center font-bold text-stone-100 text-xs leading-tight">
          <span>{formatCurrency(subtotal)}</span>
          <span className="text-[9px] font-normal text-stone-500">
            {quantity} × {formatCurrency(unitValue)}
          </span>
        </div>
      </div>

      <div className="col-span-1 text-right flex justify-end items-end pt-3">
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover transporte"
            onClick={() => modalDrafts.removeModal(draft.key)}
            className="h-6 w-6 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="Remover este transporte"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="h-6 w-6" />
        )}
      </div>
    </div>
  );
}
