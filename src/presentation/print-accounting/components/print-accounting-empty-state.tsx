import * as React from "react";
import { Button } from "@/components/ui/button";

export function PrintAccountingEmptyState() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0d0c0a] text-stone-100 p-6 text-center">
      <h2 className="text-xl font-bold text-stone-200">Nenhum lançamento selecionado</h2>
      <p className="mt-2 text-sm text-stone-400 max-w-md">
        Selecione os colaboradores desejados na tabela e clique no botão &ldquo;Imprimir p/ Contabilidade&rdquo;.
      </p>
      <Button
        onClick={() => window.close()}
        className="mt-6 bg-stone-800 hover:bg-stone-700 text-stone-200"
      >
        Fechar Janela
      </Button>
    </div>
  );
}
