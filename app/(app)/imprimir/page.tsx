import { getTransportVouchersForPrint } from "@/application/transport-voucher/use-cases/get-transport-vouchers-for-print";
import { getMealVouchersForPrint } from "@/application/meal-voucher/use-cases/get-meal-vouchers-for-print";
import { getAttendanceAwardsForPrint } from "@/application/attendance-award/use-cases/get-attendance-awards-for-print";
import { getCommissionsForPrint } from "@/application/commission/use-cases/get-commissions-for-print";
import { PrintView, type PrintItem } from "@/presentation/print/print-view";

export const metadata = {
  title: "Impressão de Recibos | Star Seg",
  description: "Visualização e impressão de recibos da Star Seg.",
};

interface ImprimirPageProps {
  searchParams: Promise<{ tipo?: string; ids?: string }>;
}

async function loadPrintData(
  tipo: string | undefined,
  ids: string[],
): Promise<PrintItem[]> {
  if (!tipo || ids.length === 0) return [];

  if (tipo === "transporte") {
    const res = await getTransportVouchersForPrint(ids);
    return res.success && res.data ? (res.data as unknown as PrintItem[]) : [];
  }
  if (tipo === "alimentacao") {
    const res = await getMealVouchersForPrint(ids);
    return res.success && res.data ? (res.data as unknown as PrintItem[]) : [];
  }
  if (tipo === "assiduidade") {
    const res = await getAttendanceAwardsForPrint(ids);
    return res.success && res.data ? (res.data as unknown as PrintItem[]) : [];
  }
  if (tipo === "comissao") {
    const res = await getCommissionsForPrint(ids);
    return res.success && res.data ? (res.data as unknown as PrintItem[]) : [];
  }
  return [];
}

export default async function ImprimirPage({
  searchParams,
}: ImprimirPageProps) {
  const { tipo, ids: idsParam } = await searchParams;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : [];
  const data = await loadPrintData(tipo, ids);

  return <PrintView tipo={tipo} data={data} />;
}
