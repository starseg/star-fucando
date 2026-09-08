import { MealVoucherView } from "@/presentation/meal-voucher/meal-voucher-view";

export const metadata = {
  title: "Vale Alimentação | Star Seg",
  description: "Gestão e emissão de recibos de vale alimentação.",
};

interface ValeAlimentacaoPageProps {
  searchParams: Promise<{ q?: string; mes?: string; ano?: string; page?: string }>;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function ValeAlimentacaoPage({ searchParams }: ValeAlimentacaoPageProps) {
  const { q, mes, ano, page } = await searchParams;
  const now = new Date();

  return (
    <MealVoucherView
      searchQuery={q}
      month={parsePositiveInt(mes, now.getMonth() + 1)}
      year={parsePositiveInt(ano, now.getFullYear())}
      page={parsePositiveInt(page, 1)}
    />
  );
}
