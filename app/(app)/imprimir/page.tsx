import * as React from "react";
import { PrintView } from "@/presentation/print/print-view";

export const metadata = {
  title: "Impressão de Recibos | Star Seg",
  description: "Visualização e impressão de recibos da Star Seg.",
};

export default function ImprimirPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-stone-950 text-stone-300">
          Carregando recibos para impressão...
        </div>
      }
    >
      <PrintView />
    </React.Suspense>
  );
}
