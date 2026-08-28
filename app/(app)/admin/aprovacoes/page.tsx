import { UserApprovalView } from "@/presentation/admin/user-approval-view";

export const metadata = {
  title: "Aprovações de Acesso | Star Seg",
  description: "Gerenciamento de acessos e permissões de usuários.",
};

export default function AprovacoesPage() {
  return <UserApprovalView />;
}
