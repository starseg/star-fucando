import { getTransportVouchersForPrint } from "@/application/transport-voucher/use-cases/get-transport-vouchers-for-print";
import { getMealVouchersForPrint } from "@/application/meal-voucher/use-cases/get-meal-vouchers-for-print";
import { getAttendanceAwardsForPrint } from "@/application/attendance-award/use-cases/get-attendance-awards-for-print";
import {
  PrintAccountingView,
  type PrintAccountingItem,
} from "@/presentation/print-accounting/print-accounting-view";

export const metadata = {
  title: "Relatório para Contabilidade | Star Seg",
  description:
    "Relatório tabular consolidado para a contabilidade com dados de benefícios e chaves PIX.",
};

interface ImprimirContabilidadePageProps {
  searchParams: Promise<{
    tipo?: string;
    ids?: string;
    mes?: string;
    ano?: string;
  }>;
}

async function loadAccountingData(
  tipo: string | undefined,
  ids: string[],
): Promise<PrintAccountingItem[]> {
  if (!tipo || ids.length === 0) return [];

  if (tipo === "transporte") {
    const res = await getTransportVouchersForPrint(ids);
    return res.success && res.data
      ? (res.data as unknown as PrintAccountingItem[])
      : [];
  }
  if (tipo === "alimentacao") {
    const res = await getMealVouchersForPrint(ids);
    return res.success && res.data
      ? (res.data as unknown as PrintAccountingItem[])
      : [];
  }
  if (tipo === "assiduidade") {
    const res = await getAttendanceAwardsForPrint(ids);
    return res.success && res.data
      ? (res.data as unknown as PrintAccountingItem[])
      : [];
  }
  return [];
}

export default async function ImprimirContabilidadePage({
  searchParams,
}: ImprimirContabilidadePageProps) {
  const { tipo, ids: idsParam, mes, ano } = await searchParams;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : [];
  const data = await loadAccountingData(tipo, ids);

  return <PrintAccountingView tipo={tipo} data={data} mes={mes} ano={ano} />;
}
