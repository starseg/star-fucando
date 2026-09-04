"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { getTransportVouchersForPrint } from "@/application/transport-voucher/transport-voucher-actions";
import { getMealVouchersForPrint } from "@/application/meal-voucher/meal-voucher-actions";
import { getAttendanceAwardsForPrint } from "@/application/attendance-award/attendance-award-actions";
import { TransportReceipt } from "./components/transport-receipt";
import { MealReceipt } from "./components/meal-receipt";
import { AttendanceReceipt } from "./components/attendance-receipt";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

type TransportPrintItem = React.ComponentProps<typeof TransportReceipt>["voucher"];
type MealPrintItem = React.ComponentProps<typeof MealReceipt>["voucher"];
type AttendancePrintItem = React.ComponentProps<typeof AttendanceReceipt>["award"];
type PrintItem = TransportPrintItem | MealPrintItem | AttendancePrintItem;

export function PrintView() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");
  const idsParam = searchParams.get("ids");

  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<PrintItem[]>([]);

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
          if (res.success && res.data) setData(res.data as unknown as TransportPrintItem[]);
        } else if (tipo === "alimentacao") {
          const res = await getMealVouchersForPrint(ids);
          if (res.success && res.data) setData(res.data as unknown as MealPrintItem[]);
        } else if (tipo === "assiduidade") {
          const res = await getAttendanceAwardsForPrint(ids);
          if (res.success && res.data) setData(res.data as unknown as AttendancePrintItem[]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados para impressão.");
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
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  const triggerBrowserPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-950 text-stone-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm text-stone-400">Preparando recibos para impressão...</p>
      </div>
    );
  }

  if (!tipo || data.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-950 text-stone-100 p-6 text-center">
        <h2 className="text-xl font-bold text-stone-200">Nenhum recibo selecionado</h2>
        <p className="mt-2 text-sm text-stone-400 max-w-md">
          Selecione os colaboradores e benefícios desejados na tabela e clique no botão de impressão.
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

  return (
    <div className="min-h-screen bg-stone-900 print:bg-white">
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .receipt-page {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 flex items-center justify-between border-b border-stone-800 bg-stone-950/90 px-6 py-3 backdrop-blur-md">
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
          <span className="text-sm font-semibold text-stone-200">
            Visualização de Impressão • {data.length} recibo(s) pronto(s)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={triggerBrowserPrint}
            className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>

      <div className="py-8 px-4 print:p-0">
        {tipo === "transporte" &&
          data.map((voucher) => (
            <TransportReceipt key={voucher.id} voucher={voucher as TransportPrintItem} />
          ))}

        {tipo === "alimentacao" &&
          data.map((voucher) => (
            <MealReceipt key={voucher.id} voucher={voucher as MealPrintItem} />
          ))}

        {tipo === "assiduidade" &&
          data.map((award) => (
            <AttendanceReceipt key={award.id} award={award as AttendancePrintItem} />
          ))}
      </div>
    </div>
  );
}
