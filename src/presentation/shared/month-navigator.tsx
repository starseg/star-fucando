"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigatorProps {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function MonthNavigator({ month, year, onChange }: MonthNavigatorProps) {
  const goToPreviousMonth = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900/80 p-1 backdrop-blur shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousMonth}
        className="h-8 w-8 text-stone-400 hover:bg-stone-800 hover:text-stone-100 rounded-lg"
        title="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-stone-100 min-w-[140px] justify-center select-none">
        <CalendarIcon className="h-4 w-4 text-amber-500" />
        <span>
          {MONTH_NAMES[month - 1]} de {year}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextMonth}
        className="h-8 w-8 text-stone-400 hover:bg-stone-800 hover:text-stone-100 rounded-lg"
        title="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrentMonth() && (
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          className="h-7 text-xs border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 ml-1 rounded-lg px-2"
        >
          Mês Atual
        </Button>
      )}
    </div>
  );
}
