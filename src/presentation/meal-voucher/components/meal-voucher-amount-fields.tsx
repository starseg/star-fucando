import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import type { MealVoucherFormData } from "./meal-voucher-form";

interface MealVoucherAmountFieldsProps {
  register: UseFormRegister<MealVoucherFormData>;
  onWorkedDaysChange: (days: number) => void;
  onUnitValueChange: (unit: number) => void;
}

export function MealVoucherAmountFields({
  register,
  onWorkedDaysChange,
  onUnitValueChange,
}: MealVoucherAmountFieldsProps) {
  return (
    <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-3">
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Valores e Diárias
      </span>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-stone-400">Dias Trabalhados</Label>
          <Input
            type="number"
            {...register("workedDays", {
              onChange: (e) => onWorkedDaysChange(parseInt(e.target.value, 10) || 0),
            })}
            className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-stone-400">Valor da Diária (R$)</Label>
          <Input
            type="number"
            step="0.01"
            {...register("unitValue", {
              onChange: (e) => onUnitValueChange(parseFloat(e.target.value) || 0),
            })}
            className="bg-stone-950 border-stone-700 text-stone-100 h-9 font-semibold text-center rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <Label className="text-xs text-stone-400">Descontos / Coparticipação em Folha (R$)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0,00"
          {...register("discounts")}
          className="bg-stone-950 border-stone-700 text-stone-100 h-9 text-xs rounded-lg"
        />
      </div>
    </div>
  );
}
