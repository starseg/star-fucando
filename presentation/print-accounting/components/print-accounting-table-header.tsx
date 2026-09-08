import * as React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PrintAccountingTableHeaderProps {
  tipo: string;
}

export function PrintAccountingTableHeader({ tipo }: PrintAccountingTableHeaderProps) {
  return (
    <TableHeader className="bg-stone-950/90 border-b border-stone-800">
      <TableRow className="border-none hover:bg-transparent">
        <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider pl-4">
          Colaborador
        </TableHead>

        {tipo === "transporte" && (
          <>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Dias Úteis / Trajeto
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-center">
              Qtd. Vales
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right pr-4">
              Valor Total
            </TableHead>
          </>
        )}

        {tipo === "alimentacao" && (
          <>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Dias / Diária
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right">
              Total Bruto
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right pr-4">
              Valor Líquido
            </TableHead>
          </>
        )}

        {tipo === "assiduidade" && (
          <>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Competência
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right pr-4">
              Valor da Bonificação
            </TableHead>
          </>
        )}
      </TableRow>
    </TableHeader>
  );
}
