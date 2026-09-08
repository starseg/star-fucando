import { PendingApprovalView } from "@/presentation/auth/pending-approval-view";

export const metadata = {
  title: "Aguardando Aprovação | Star Seg",
  description: "Status de aprovação de acesso corporativo.",
};

export default function AguardandoAprovacaoPage() {
  return <PendingApprovalView />;
}
