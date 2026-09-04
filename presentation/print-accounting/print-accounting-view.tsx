"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { getTransportVouchersForPrint } from "@/application/transport-voucher/transport-voucher-actions";
import { getMealVouchersForPrint } from "@/application/meal-voucher/meal-voucher-actions";
import { getAttendanceAwardsForPrint } from "@/application/attendance-award/attendance-award-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Printer, ArrowLeft, Loader2, Bus, Utensils, Award, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface PrintAccountingItem {
  id: string;
  referenceMonth?: Date | string;
  employee?: {
    name?: string;
    department?: string | null;
    role?: string | null;
    pix?: string | null;
  };
  // Vale Transporte
  workingDays?: number;
  modals?: { name: string }[];
  inboundValue?: number;
  outboundValue?: number;
  totalVouchers?: number;
  totalValue?: number;
  discountPercentage?: number | null;
  // Vale Alimentação
  workedDays?: number;
  unitValue?: number;
  discounts?: number | null;
  netValue?: number;
  // Prêmio Assiduidade
  bonusValue?: number;
}

export function PrintAccountingView() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");
  const idsParam = searchParams.get("ids");
  const mesParam = searchParams.get("mes");
  const anoParam = searchParams.get("ano");

  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<PrintAccountingItem[]>([]);

  React.useEffect(() => {
    async function loadData() {
      if (!idsParam || !tipo) {
        setIsLoading(false);
        return;
      }

      const ids = idsParam.split(",").filter(Boolean);
      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (tipo === "transporte") {
          const res = await getTransportVouchersForPrint(ids);
          if (res.success && res.data) setData(res.data);
        } else if (tipo === "alimentacao") {
          const res = await getMealVouchersForPrint(ids);
          if (res.success && res.data) setData(res.data);
        } else if (tipo === "assiduidade") {
          const res = await getAttendanceAwardsForPrint(ids);
          if (res.success && res.data) setData(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do relatório.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [tipo, idsParam]);

  // Dispara a impressão automaticamente assim que carregar
  React.useEffect(() => {
    if (!isLoading && data.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  const triggerBrowserPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0d0c0a] text-stone-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm text-stone-400">Preparando relatório para a contabilidade...</p>
      </div>
    );
  }

  if (!tipo || data.length === 0) {
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

  const getThemeConfig = () => {
    switch (tipo) {
      case "transporte":
        return {
          title: "Relatório de Vale Transporte",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          accentColor: "text-amber-400",
          icon: Bus,
          summaryLabel: "Total de Vales / Passagens",
        };
      case "alimentacao":
        return {
          title: "Relatório de Vale Alimentação",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          accentColor: "text-emerald-400",
          icon: Utensils,
          summaryLabel: "Total de Diárias",
        };
      case "assiduidade":
      default:
        return {
          title: "Relatório de Prêmio Assiduidade",
          badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          accentColor: "text-sky-400",
          icon: Award,
          summaryLabel: "Colaboradores Premiados",
        };
    }
  };

  const theme = getThemeConfig();
  const Icon = theme.icon;

  const totalValueSum =
    tipo === "transporte"
      ? data.reduce((acc, item) => acc + Number(item.totalValue), 0)
      : tipo === "alimentacao"
      ? data.reduce((acc, item) => acc + Number(item.netValue), 0)
      : data.reduce((acc, item) => acc + Number(item.bonusValue), 0);

  const referenceDateFormatted =
    data[0]?.referenceMonth
      ? formatMonthYear(data[0].referenceMonth)
      : mesParam && anoParam
      ? formatMonthYear(new Date(Number(anoParam), Number(mesParam) - 1, 1))
      : "";

  return (
    <div className="min-h-screen bg-[#0d0c0a] text-stone-100">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #0d0c0a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 flex items-center justify-between border-b border-stone-800 bg-[#12100e]/95 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-stone-400 hover:text-stone-100"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-stone-200">
              Relatório para Contabilidade • {data.length} colaborador(es) selecionado(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={triggerBrowserPrint}
            className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20 px-4 h-9"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>

      <div className="print-container mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800/80">
            <div className="flex items-center gap-3.5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.badgeColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-stone-100 tracking-tight">
                    {theme.title}
                  </h1>
                  <span className="text-xs uppercase px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Contabilidade
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  STAR SEG • Relatório consolidado de pagamentos de benefícios com chave PIX
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              {referenceDateFormatted && (
                <div className="px-3.5 py-1.5 rounded-xl border border-stone-800 bg-stone-900/60">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Competência
                  </span>
                  <span className="text-xs font-semibold text-stone-200 capitalize">
                    {referenceDateFormatted}
                  </span>
                </div>
              )}
              <div className="px-3.5 py-1.5 rounded-xl border border-stone-800 bg-stone-900/60">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Total Consolidado
                </span>
                <span className={`text-sm font-black ${theme.accentColor}`}>
                  {formatCurrency(totalValueSum)}
                </span>
              </div>
            </div>
          </div>

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
                {data.map((item) => {
                  const emp = item.employee || {};
                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-stone-800/60 transition-colors hover:bg-stone-800/20"
                    >
                      <TableCell className="pl-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black border mt-0.5 ${theme.badgeColor}`}
                          >
                            {(emp.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-stone-100 text-sm block">
                              {emp.name}
                            </span>
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
                              <span className="text-[10px] text-stone-400">
                                Desc. {item.discountPercentage}%
                              </span>
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
                              <span className="text-xs text-stone-400">
                                Diária de {formatCurrency(item.unitValue)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-3.5">
                            <span className="text-sm font-semibold text-stone-300 block">
                              {formatCurrency(item.totalValue)}
                            </span>
                            {(item.discounts ?? 0) > 0 && (
                              <span className="text-[10px] text-red-400">
                                Desc. -{formatCurrency(item.discounts)}
                              </span>
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
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-400">
            <span>
              Total de registros: <strong className="text-stone-200">{data.length} colaboradores</strong>
            </span>
            <span>
              Relatório gerado em: <strong className="text-stone-200">{new Date().toLocaleDateString("pt-BR")}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
