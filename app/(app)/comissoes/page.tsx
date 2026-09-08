import { CommissionView } from "@/presentation/commission/commission-view";

export const metadata = {
  title: "Comissões | Star Seg",
  description: "Gestão e emissão de recibos de comissão dos técnicos.",
};

interface ComissoesPageProps {
  searchParams: Promise<{ q?: string; mes?: string; ano?: string; page?: string }>;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function ComissoesPage({ searchParams }: ComissoesPageProps) {
  const { q, mes, ano, page } = await searchParams;
  const now = new Date();

  return (
    <CommissionView
      searchQuery={q}
      month={parsePositiveInt(mes, now.getMonth() + 1)}
      year={parsePositiveInt(ano, now.getFullYear())}
      page={parsePositiveInt(page, 1)}
    />
  );
}
