"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AttendanceAwardConfirmIntegralDialogProps {
  isOpen: boolean;
  bonusValue: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AttendanceAwardConfirmIntegralDialog({
  isOpen,
  bonusValue,
  onConfirm,
  onCancel,
}: AttendanceAwardConfirmIntegralDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-stone-100">
              Confirmar Prêmio Integral
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-stone-300 leading-relaxed pt-1">
            O valor informado (<span className="font-semibold text-stone-100">{formatCurrency(bonusValue)}</span>) está abaixo de R$ 300,00, que é a referência para assiduidade integral.
            <span className="block mt-2 text-stone-400">
              Deseja realmente manter este prêmio como <strong className="text-emerald-400 font-semibold">Integral</strong>?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 border-t border-stone-800">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-transparent border-stone-700/60 text-stone-300 hover:text-stone-100 hover:bg-stone-800/60 rounded-xl text-xs"
          >
            Manter Parcial
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="font-bold px-4 rounded-xl shadow-md bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/20 text-xs"
          >
            Confirmar Integral
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
