import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransportVoucherDiscountFieldsProps {
  discountPercentage: number | string;
  onDiscountPercentageChange: (value: string) => void;
  observations: string;
  onObservationsChange: (value: string) => void;
}

export function TransportVoucherDiscountFields({
  discountPercentage,
  onDiscountPercentageChange,
  observations,
  onObservationsChange,
}: TransportVoucherDiscountFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div className="space-y-1">
        <Label className="text-xs text-stone-400">Desconto em Folha (%)</Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          placeholder="Ex: 6.0"
          value={discountPercentage}
          onChange={(e) => onDiscountPercentageChange(e.target.value)}
          className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-stone-400">Observações (opcional)</Label>
        <Input
          placeholder="Ex: Escala 12x36..."
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          className="bg-stone-900 border-stone-700/60 text-stone-100 h-8 text-xs rounded-lg"
        />
      </div>
    </div>
  );
}
