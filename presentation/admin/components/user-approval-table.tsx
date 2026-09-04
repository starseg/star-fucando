"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserRole, UserStatus } from "@prisma/client";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Shield,
  UserCheck,
  UserX,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { approveUser } from "@/application/user/use-cases/approve-user";
import { rejectUser } from "@/application/user/use-cases/reject-user";
import { setUserRole } from "@/application/user/use-cases/set-user-role";
import { DataTable } from "@/presentation/shared/data-table";
import { useConfirmedRowAction } from "@/presentation/shared/hooks/use-confirmed-row-action";

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

function getStatusBadge(status: UserStatus) {
  switch (status) {
    case UserStatus.APPROVED:
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovado
        </Badge>
      );
    case UserStatus.PENDING:
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          Pendente
        </Badge>
      );
    case UserStatus.REJECTED:
      return (
        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <XCircle className="h-3.5 w-3.5" />
          Rejeitado
        </Badge>
      );
  }
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
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const isProcessing = [approvingId, rejectingId, togglingRoleId].includes(user.id);

          return (
            <DataTable.Row key={user.id}>
              <TableCell className="pl-5">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || user.email}
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-full border border-stone-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-100 text-sm">{user.name || "Sem nome"}</span>
                      {isSelf && (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                          Você
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-300 font-mono">{user.email}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {user.role === UserRole.ADMIN ? (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                      <Shield className="h-3.5 w-3.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-stone-300">Usuário</span>
                  )}
                </div>
              </TableCell>

              <TableCell>{getStatusBadge(user.status)}</TableCell>

              <TableCell className="text-xs text-stone-300">{formatDate(user.createdAt)}</TableCell>

              <TableCell className="text-xs text-stone-300">
                {user.approvedBy ? (
                  <span title={user.approvedBy.email}>{user.approvedBy.name || user.approvedBy.email}</span>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell className="text-right pr-5">
                <DataTable.Actions>
                  {user.status !== UserStatus.APPROVED && (
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => approveUserRow(user)}
                      className="h-8 px-2.5 rounded-lg bg-emerald-600/90 text-white hover:bg-emerald-500 text-xs font-semibold gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Aprovar
                    </Button>
                  )}

                  {user.status !== UserStatus.REJECTED && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isProcessing || isSelf}
                      onClick={() => rejectUserRow(user)}
                      className="h-8 px-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-30"
                      title={isSelf ? "Você não pode rejeitar a si mesmo" : "Rejeitar acesso"}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Rejeitar
                    </Button>
                  )}

                  {user.status === UserStatus.APPROVED && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isProcessing || isSelf}
                      onClick={() => toggleUserRoleRow(user)}
                      className="h-8 px-2.5 rounded-lg border-stone-700 bg-stone-800/40 text-stone-300 hover:bg-stone-800 text-xs gap-1.5 cursor-pointer disabled:opacity-30"
                      title={isSelf ? "Você não pode alterar seu próprio papel" : "Alternar papel"}
                    >
                      <Shield className="h-3.5 w-3.5 text-amber-400" />
                      {user.role === UserRole.ADMIN ? "Rebaixar" : "Tornar Admin"}
                    </Button>
                  )}
                </DataTable.Actions>
              </TableCell>
            </DataTable.Row>
          );
        })}
      </DataTable.Body>
    </DataTable.Root>
  );
}
