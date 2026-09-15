import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { UseFormRegister } from "react-hook-form";
import type { AttendanceAwardType } from "@prisma/client";
import type { AttendanceAwardFormData } from "./attendance-award-form";

interface AttendanceAwardBonusFieldsProps {
  register: UseFormRegister<AttendanceAwardFormData>;
  bonusError?: string;
  watchedBonus: number;
  onBonusValueChange: (value: number) => void;
  bonusType: AttendanceAwardType;
  onBonusTypeChange: (value: AttendanceAwardType) => void;
}

export function AttendanceAwardBonusFields({
  register,
  bonusError,
  watchedBonus,
  onBonusValueChange,
  bonusType,
  onBonusTypeChange,
}: AttendanceAwardBonusFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Valor da Bonificação (R$) *</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Ex: 300,00"
          {...register("bonusValue", { onChange: (e) => onBonusValueChange(Number(e.target.value)) })}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl font-semibold"
        />
        {bonusError && <p className="text-xs text-red-400">{bonusError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Tipo de Premiação *</Label>
        <Select value={bonusType} onValueChange={(val) => onBonusTypeChange(val as AttendanceAwardType)}>
          <SelectTrigger className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
            <SelectItem value="INTEGRAL">Integral</SelectItem>
            <SelectItem value="PARCIAL">Parcial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-sky-500/10 border border-sky-500/25 p-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Valor da Premiação
        </span>
        <span className="text-2xl font-black text-sky-400">{formatCurrency(watchedBonus)}</span>
      </div>
    </>
  );
}
