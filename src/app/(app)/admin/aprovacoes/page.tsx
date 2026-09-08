import { UserApprovalView } from "@/presentation/admin/user-approval-view";
import { UserStatus } from "@prisma/client";

export const metadata = {
  title: "Aprovações de Acesso | Star Seg",
  description: "Gerenciamento de acessos e permissões de usuários.",
};

const VALID_STATUSES = new Set(Object.values(UserStatus));

function parseStatus(value?: string): UserStatus | undefined {
  return value && VALID_STATUSES.has(value as UserStatus) ? (value as UserStatus) : undefined;
}

interface AprovacoesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AprovacoesPage({ searchParams }: AprovacoesPageProps) {
  const { q, status, page } = await searchParams;
  const parsedPage = Number(page);

  return (
    <UserApprovalView
      searchQuery={q}
      status={parseStatus(status)}
      page={Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1}
    />
  );
}
