import { EmployeeView } from "@/presentation/employee/employee-view";

export const metadata = {
  title: "Colaboradores | Star Seg",
  description: "Gestão e cadastro de colaboradores da Star Seg.",
};

interface ColaboradoresPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ColaboradoresPage({ searchParams }: ColaboradoresPageProps) {
  const { q, page } = await searchParams;
  const parsedPage = Number(page);
  return <EmployeeView searchQuery={q} page={Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1} />;
}
