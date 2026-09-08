"use client";

import * as React from "react";
import { formatMonthYear } from "@/lib/utils";
import { getThemeConfig } from "./print-accounting-theme";
import { PrintAccountingToolbar } from "./components/print-accounting-toolbar";
import { PrintAccountingEmptyState } from "./components/print-accounting-empty-state";
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
  commissionValue?: number;
}

interface PrintAccountingViewProps {
  tipo: string | undefined;
  data: PrintAccountingItem[];
  mes?: string;
  ano?: string;
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

  if (!tipo || data.length === 0) {
    return <PrintAccountingEmptyState />;
  }

  const theme = getThemeConfig(tipo);

  const totalValueSum =
    tipo === "transporte"
      ? data.reduce((acc, item) => acc + Number(item.totalValue), 0)
      : tipo === "alimentacao"
      ? data.reduce((acc, item) => acc + Number(item.netValue), 0)
      : tipo === "comissao"
      ? data.reduce((acc, item) => acc + Number(item.commissionValue), 0)
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

      <PrintAccountingToolbar recordCount={data.length} onPrint={() => window.print()} />

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
