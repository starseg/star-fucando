"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTH_NAMES } from "@/lib/utils";
import { Copy, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CopyPreviousMonthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetMonth: number; // 1-12
  targetYear: number;
  benefitTitle: string; // Ex: "Vale Transporte"
  accentColor?: "amber" | "emerald" | "sky";
  onCopy: (
    sourceMonth: number,
    sourceYear: number,
    targetMonth: number,
    targetYear: number
  ) => Promise<{ success: boolean; count?: number; error?: string }>;
}

export function CopyPreviousMonthDialog({
  isOpen,
  onClose,
  onSuccess,
  targetMonth,
  targetYear,
  benefitTitle,
  accentColor = "amber",
  onCopy,
}: CopyPreviousMonthDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  // Mês padrão de origem: mês anterior ao selecionado
  const defaultSourceMonth = targetMonth === 1 ? 12 : targetMonth - 1;
  const defaultSourceYear = targetMonth === 1 ? targetYear - 1 : targetYear;

  const [sourceMonth, setSourceMonth] = React.useState<number>(defaultSourceMonth);
  const [sourceYear, setSourceYear] = React.useState<number>(defaultSourceYear);

  React.useEffect(() => {
    if (isOpen) {
      setSourceMonth(targetMonth === 1 ? 12 : targetMonth - 1);
      setSourceYear(targetMonth === 1 ? targetYear - 1 : targetYear);
    }
  }, [isOpen, targetMonth, targetYear]);

  const colorStyles = {
    amber: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      button: "bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20",
      icon: "text-amber-400",
    },
    emerald: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      button: "bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/20",
      icon: "text-emerald-400",
    },
    sky: {
      badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      button: "bg-sky-500 text-stone-950 hover:bg-sky-400 shadow-sky-500/20",
      icon: "text-sky-400",
    },
  }[accentColor];

  const handleConfirm = async () => {
    if (sourceMonth === targetMonth && sourceYear === targetYear) {
      toast.error("O mês de origem não pode ser igual ao mês de destino.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await onCopy(sourceMonth, sourceYear, targetMonth, targetYear);
      if (res.success) {
        toast.success(
          `${res.count || 0} lançamento(s) de ${benefitTitle} copiado(s) de ${
            MONTH_NAMES[sourceMonth - 1]
          }/${sourceYear} para ${MONTH_NAMES[targetMonth - 1]}/${targetYear}!`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Não foi possível copiar os lançamentos.");
      }
    } catch {
      toast.error("Erro inesperado ao copiar lançamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  const years = [targetYear - 1, targetYear, targetYear + 1];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colorStyles.badge}`}
            >
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-stone-100">
                Copiar Lançamentos Anteriores
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-400">
                {benefitTitle} • Replicar lançamentos de outro mês
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Fluxo Visual Origem -> Destino */}
          <div className="rounded-xl border border-stone-800/80 bg-stone-900/40 p-4">
            <div className="flex items-center justify-between gap-2">
              {/* De (Origem) */}
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Copiar de (Origem)
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Select
                    value={String(sourceMonth)}
                    onValueChange={(val) => setSourceMonth(Number(val))}
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
                    onValueChange={(val) => setSourceYear(Number(val))}
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

              {/* Para (Destino) */}
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

          {/* Aviso Informativo */}
          <div className="flex items-start gap-2.5 rounded-xl bg-stone-900/60 border border-stone-800 p-3 text-xs text-stone-400 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-stone-300 shrink-0 mt-0.5" />
            <span>
              Todos os colaboradores, valores e modais do mês de origem serão copiados para{" "}
              <strong className="text-stone-200">
                {MONTH_NAMES[targetMonth - 1]} de {targetYear}
              </strong>
              . Lançamentos existentes no mês de destino serão atualizados.
            </span>
          </div>

          <DialogFooter className="pt-3 border-t border-stone-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-stone-400 hover:text-stone-100 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`font-bold px-5 rounded-xl shadow-md ${colorStyles.button}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Copiando...
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copiar Lançamentos
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
