import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { UseFormRegister } from "react-hook-form";
import type { CommissionFormData } from "./commission-form";

interface CommissionValueFieldsProps {
  register: UseFormRegister<CommissionFormData>;
  commissionError?: string;
  watchedCommission: number;
}

export function CommissionValueFields({ register, commissionError, watchedCommission }: CommissionValueFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Valor da Comissão (R$) *</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Ex: 300,00"
          {...register("commissionValue")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl font-semibold"
        />
        {commissionError && <p className="text-xs text-red-400">{commissionError}</p>}
      </div>

      <div className="rounded-xl bg-violet-500/10 border border-violet-500/25 p-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Valor da Comissão
        </span>
        <span className="text-2xl font-black text-violet-400">{formatCurrency(watchedCommission)}</span>
      </div>
    </>
  );
}
