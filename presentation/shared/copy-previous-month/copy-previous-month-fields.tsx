import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CopyPreviousMonthFieldsProps {
  sourceMonth: number;
  sourceYear: number;
  targetMonth: number;
  targetYear: number;
  years: number[];
  isLoading: boolean;
  onSourceMonthChange: (month: number) => void;
  onSourceYearChange: (year: number) => void;
}

export function CopyPreviousMonthFields({
  sourceMonth,
  sourceYear,
  targetMonth,
  targetYear,
  years,
  isLoading,
  onSourceMonthChange,
  onSourceYearChange,
}: CopyPreviousMonthFieldsProps) {
  return (
    <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Copiar de (Origem)
          </span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Select
              value={String(sourceMonth)}
              onValueChange={(val) => onSourceMonthChange(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-stone-950 border-stone-700 text-stone-100 h-9 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={name} value={String(idx + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(sourceYear)}
              onValueChange={(val) => onSourceYearChange(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-stone-950 border-stone-700 text-stone-100 h-9 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-5 text-stone-500">
          <ArrowRight className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Para (Destino)
          </span>
          <div className="h-9 flex items-center justify-center rounded-lg bg-stone-950 border border-stone-700/60 px-3 text-xs font-bold text-stone-100 mt-1">
            {MONTH_NAMES[targetMonth - 1]} / {targetYear}
          </div>
        </div>
      </div>
    </div>
  );
}
