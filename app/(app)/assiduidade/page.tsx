import { AttendanceAwardView } from "@/presentation/attendance-award/attendance-award-view";

export const metadata = {
  title: "Prêmio Assiduidade | Star Seg",
  description: "Gestão e emissão de recibos de premiação de assiduidade.",
};

interface AssiduidadePageProps {
  searchParams: Promise<{ q?: string; mes?: string; ano?: string; page?: string }>;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function AssiduidadePage({ searchParams }: AssiduidadePageProps) {
  const { q, mes, ano, page } = await searchParams;
  const now = new Date();

  return (
    <AttendanceAwardView
      searchQuery={q}
      month={parsePositiveInt(mes, now.getMonth() + 1)}
      year={parsePositiveInt(ano, now.getFullYear())}
      page={parsePositiveInt(page, 1)}
    />
  );
}
