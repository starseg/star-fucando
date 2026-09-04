import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import type { PrintAccountingItem } from "../print-accounting-view";

interface PrintAccountingTableProps {
  tipo: string;
  data: PrintAccountingItem[];
  badgeColor: string;
}

export function PrintAccountingTable({ tipo, data, badgeColor }: PrintAccountingTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-800/90 bg-[#12100e]/80">
      <Table>
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

        <TableBody>
          {data.map((item) => (
            <PrintAccountingTableRow key={item.id} tipo={tipo} item={item} badgeColor={badgeColor} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface PrintAccountingTableRowProps {
  tipo: string;
  item: PrintAccountingItem;
  badgeColor: string;
}

function PrintAccountingTableRow({ tipo, item, badgeColor }: PrintAccountingTableRowProps) {
  const emp = item.employee || {};
  return (
    <TableRow className="border-b border-stone-800/60 transition-colors hover:bg-stone-800/20">
      <TableCell className="pl-4 py-3.5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black border mt-0.5 ${badgeColor}`}
          >
            {(emp.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <span className="font-bold text-stone-100 text-sm block">{emp.name}</span>
            <span className="text-xs text-stone-400 block">
              {emp.department || "Operacional"} • {emp.role || "Colaborador"}
            </span>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                <span className="font-sans font-semibold text-[10px] text-stone-400 uppercase">PIX:</span>
                {emp.pix ? emp.pix : "Não informado"}
              </span>
            </div>
          </div>
        </div>
      </TableCell>

      {tipo === "transporte" && (
        <>
          <TableCell className="py-3.5">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-stone-200 block">
                {item.workingDays} dias úteis
              </span>
              <span className="text-xs text-stone-400">
                {(item.modals?.length ?? 0) > 2
                  ? `${item.modals?.length} transportes cadastrados`
                  : `Ida (${formatCurrency(item.inboundValue)}) + Volta (${formatCurrency(item.outboundValue)})`}
              </span>
            </div>
          </TableCell>
          <TableCell className="text-center font-bold text-stone-200 text-sm py-3.5">
            {item.totalVouchers} un.
          </TableCell>
          <TableCell className="text-right pr-4 py-3.5">
            <span className="text-base font-black text-amber-400 block">
              {formatCurrency(item.totalValue)}
            </span>
            {item.discountPercentage ? (
              <span className="text-[10px] text-stone-400">Desc. {item.discountPercentage}%</span>
            ) : null}
          </TableCell>
        </>
      )}

      {tipo === "alimentacao" && (
        <>
          <TableCell className="py-3.5">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-stone-200 block">
                {item.workedDays} {item.workedDays === 1 ? "dia" : "dias"}
              </span>
              <span className="text-xs text-stone-400">Diária de {formatCurrency(item.unitValue)}</span>
            </div>
          </TableCell>
          <TableCell className="text-right py-3.5">
            <span className="text-sm font-semibold text-stone-300 block">
              {formatCurrency(item.totalValue)}
            </span>
            {(item.discounts ?? 0) > 0 && (
              <span className="text-[10px] text-red-400">Desc. -{formatCurrency(item.discounts)}</span>
            )}
          </TableCell>
          <TableCell className="text-right pr-4 py-3.5">
            <span className="text-base font-black text-emerald-400 block">
              {formatCurrency(item.netValue)}
            </span>
          </TableCell>
        </>
      )}

      {tipo === "assiduidade" && (
        <>
          <TableCell className="text-xs font-medium text-stone-300 py-3.5">
            {formatMonthYear(item.referenceMonth)}
          </TableCell>
          <TableCell className="text-right pr-4 py-3.5">
            <span className="text-base font-black text-sky-400 block">
              {formatCurrency(item.bonusValue)}
            </span>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
