"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { commissionCopyConfig } from "../commission-copy-config";

interface CommissionCopyButtonProps {
  targetMonth: number;
  targetYear: number;
}

export function CommissionCopyButton({
  targetMonth,
  targetYear,
}: CommissionCopyButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl h-10 px-3.5 text-xs shadow-sm"
        title="Copiar todas as comissões do mês selecionado"
      >
        <Copy className="mr-1.5 h-3.5 w-3.5 text-violet-400" />
        Copiar Lançamentos de Outro Mês
      </Button>

      <CopyPreviousMonthDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => router.refresh()}
        targetMonth={targetMonth}
        targetYear={targetYear}
        config={commissionCopyConfig}
      />
    </>
  );
}
