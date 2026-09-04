"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils";
import { Printer, ArrowLeft, Bus, Utensils, Award, FileSpreadsheet } from "lucide-react";
import { PrintAccountingHeader } from "./components/print-accounting-header";
import { PrintAccountingTable } from "./components/print-accounting-table";
import { PrintAccountingSummaryFooter } from "./components/print-accounting-summary-footer";

export interface PrintAccountingItem {
  id: string;
  referenceMonth?: Date | string;
  employee?: {
    name?: string;
    department?: string | null;
    role?: string | null;
    pix?: string | null;
  };
  workingDays?: number;
  modals?: { name: string }[];
  inboundValue?: number;
  outboundValue?: number;
  totalVouchers?: number;
  totalValue?: number;
  discountPercentage?: number | null;
  workedDays?: number;
  unitValue?: number;
  discounts?: number | null;
  netValue?: number;
  bonusValue?: number;
}

interface PrintAccountingViewProps {
  tipo: string | undefined;
  data: PrintAccountingItem[];
  mes?: string;
  ano?: string;
}

function getThemeConfig(tipo: string | undefined) {
  switch (tipo) {
    case "transporte":
      return {
        title: "Relatório de Vale Transporte",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        accentColor: "text-amber-400",
        icon: Bus,
      };
    case "alimentacao":
      return {
        title: "Relatório de Vale Alimentação",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        accentColor: "text-emerald-400",
        icon: Utensils,
      };
    case "assiduidade":
    default:
      return {
        title: "Relatório de Prêmio Assiduidade",
        badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        accentColor: "text-sky-400",
        icon: Award,
      };
  }
}

export function PrintAccountingView({ tipo, data, mes, ano }: PrintAccountingViewProps) {
  React.useEffect(() => {
    if (data.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const triggerBrowserPrint = () => {
    window.print();
  };

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

  const theme = getThemeConfig(tipo);

  const totalValueSum =
    tipo === "transporte"
      ? data.reduce((acc, item) => acc + Number(item.totalValue), 0)
      : tipo === "alimentacao"
      ? data.reduce((acc, item) => acc + Number(item.netValue), 0)
      : data.reduce((acc, item) => acc + Number(item.bonusValue), 0);

  const referenceDateFormatted =
    data[0]?.referenceMonth
      ? formatMonthYear(data[0].referenceMonth)
      : mes && ano
      ? formatMonthYear(new Date(Number(ano), Number(mes) - 1, 1))
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
          <PrintAccountingHeader
            title={theme.title}
            icon={theme.icon}
            badgeColor={theme.badgeColor}
            accentColor={theme.accentColor}
            totalValueSum={totalValueSum}
            referenceDateFormatted={referenceDateFormatted}
          />

          <PrintAccountingTable tipo={tipo} data={data} badgeColor={theme.badgeColor} />

          <PrintAccountingSummaryFooter recordCount={data.length} />
        </div>
      </div>
    </div>
  );
}
