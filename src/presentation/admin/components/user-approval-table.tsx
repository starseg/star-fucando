"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserRole, UserStatus } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { approveUser } from "@/use-cases/user/use-cases/approve-user";
import { rejectUser } from "@/use-cases/user/use-cases/reject-user";
import { setUserRole } from "@/use-cases/user/use-cases/set-user-role";
import { DataTable } from "@/presentation/shared/data-table";
import { useConfirmedRowAction } from "@/presentation/shared/hooks/use-confirmed-row-action";
import { UserApprovalTableRow } from "./user-approval-table-row";

export interface UserApprovalItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  approvedAt: Date | null;
  approvedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface UserApprovalTableProps {
  users: UserApprovalItem[];
  currentUserId?: string;
}

export function UserApprovalTable({ users, currentUserId }: UserApprovalTableProps) {
  const router = useRouter();
  const refreshDataAfterMutation = () => router.refresh();

  const { processingId: approvingId, run: runApprove } = useConfirmedRowAction({
    onSettled: refreshDataAfterMutation,
  });
  const { processingId: rejectingId, run: runReject } = useConfirmedRowAction({
    onSettled: refreshDataAfterMutation,
  });
  const { processingId: togglingRoleId, run: runToggleRole } = useConfirmedRowAction({
    onSettled: refreshDataAfterMutation,
  });

  const approveUserRow = (user: UserApprovalItem) =>
    runApprove({
      id: user.id,
      confirmMessage: `Deseja aprovar o acesso de ${user.name || "este usuário"}?`,
      action: () => approveUser(user.id),
      successMessage: "Usuário aprovado com sucesso!",
      errorMessage: "Falha ao aprovar usuário.",
      unexpectedErrorMessage: "Erro ao processar aprovação.",
    });

  const rejectUserRow = (user: UserApprovalItem) =>
    runReject({
      id: user.id,
      confirmMessage: `Deseja rejeitar/bloquear o acesso de ${user.name || "este usuário"}?`,
      action: () => rejectUser(user.id),
      successMessage: "Usuário rejeitado com sucesso!",
      errorMessage: "Falha ao rejeitar usuário.",
      unexpectedErrorMessage: "Erro ao processar rejeição.",
    });

  const toggleUserRoleRow = (user: UserApprovalItem) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const actionLabel = newRole === UserRole.ADMIN ? "promover a Administrador" : "rebaixar para Usuário Padrão";
    return runToggleRole({
      id: user.id,
      confirmMessage: `Deseja ${actionLabel} ${user.name || "este usuário"}?`,
      action: () => setUserRole(user.id, newRole),
      successMessage: `Papel alterado para ${newRole}!`,
      errorMessage: "Falha ao alterar papel do usuário.",
      unexpectedErrorMessage: "Erro ao processar alteração de papel.",
    });
  };

  if (users.length === 0) {
    return (
      <DataTable.EmptyState
        icon={ShieldCheck}
        title="Nenhum usuário encontrado"
        description="Nenhum usuário corresponde a este filtro."
      />
    );
  }

  return (
    <DataTable.Root>
      <DataTable.Header>
        <DataTable.HeadCell className="w-[300px] pl-5">Usuário</DataTable.HeadCell>
        <DataTable.HeadCell>Papel</DataTable.HeadCell>
        <DataTable.HeadCell>Status</DataTable.HeadCell>
        <DataTable.HeadCell>Data da Solicitação</DataTable.HeadCell>
        <DataTable.HeadCell>Aprovado Por</DataTable.HeadCell>
        <DataTable.HeadCell className="text-right pr-5">Ações</DataTable.HeadCell>
      </DataTable.Header>
      <DataTable.Body>
        {users.map((user) => (
          <UserApprovalTableRow
            key={user.id}
            user={user}
            isSelf={user.id === currentUserId}
            isProcessing={[approvingId, rejectingId, togglingRoleId].includes(user.id)}
            onApprove={approveUserRow}
            onReject={rejectUserRow}
            onToggleRole={toggleUserRoleRow}
          />
        ))}
      </DataTable.Body>
    </DataTable.Root>
  );
}
