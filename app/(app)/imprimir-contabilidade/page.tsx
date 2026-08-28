import * as React from "react";
import { PrintAccountingView } from "@/presentation/print-accounting/print-accounting-view";

export const metadata = {
  title: "Relatório para Contabilidade | Star Seg",
  description: "Relatório tabular consolidado para a contabilidade com dados de benefícios e chaves PIX.",
};

export default function ImprimirContabilidadePage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-stone-950 text-stone-300">
          Carregando relatório para contabilidade...
        </div>
      }
    >
      <PrintAccountingView />
    </React.Suspense>
  );
}
