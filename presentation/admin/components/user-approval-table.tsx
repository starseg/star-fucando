"use client";

import * as React from "react";
import Image from "next/image";
import { UserRole, UserStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { approveUser, rejectUser, setUserRole } from "@/application/user/user-actions";
import { toast } from "sonner";

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
  onRefresh: () => void;
}

export function UserApprovalTable({
  users,
  currentUserId,
  onRefresh,
}: UserApprovalTableProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleApprove = async (id: string, name: string | null) => {
    if (!window.confirm(`Deseja aprovar o acesso de ${name || "este usuário"}?`)) return;
    setProcessingId(id);
    try {
      const res = await approveUser(id);
      if (res.success) {
        toast.success("Usuário aprovado com sucesso!");
        onRefresh();
      } else {
        toast.error(res.error || "Falha ao aprovar usuário.");
      }
    } catch {
      toast.error("Erro ao processar aprovação.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string | null) => {
    if (!window.confirm(`Deseja rejeitar/bloquear o acesso de ${name || "este usuário"}?`)) return;
    setProcessingId(id);
    try {
      const res = await rejectUser(id);
      if (res.success) {
        toast.success("Usuário rejeitado com sucesso!");
        onRefresh();
      } else {
        toast.error(res.error || "Falha ao rejeitar usuário.");
      }
    } catch {
      toast.error("Erro ao processar rejeição.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (id: string, currentRole: UserRole, name: string | null) => {
    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const actionLabel = newRole === UserRole.ADMIN ? "promover a Administrador" : "rebaixar para Usuário Padrão";
    if (!window.confirm(`Deseja ${actionLabel} ${name || "este usuário"}?`)) return;

    setProcessingId(id);
    try {
      const res = await setUserRole(id, newRole);
      if (res.success) {
        toast.success(`Papel alterado para ${newRole}!`);
        onRefresh();
      } else {
        toast.error(res.error || "Falha ao alterar papel do usuário.");
      }
    } catch {
      toast.error("Erro ao processar alteração de papel.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
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
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40 shadow-xl backdrop-blur-md">
      <Table>
        <TableHeader className="bg-stone-900/80">
          <TableRow className="border-stone-800 hover:bg-transparent">
            <TableHead className="w-[300px] text-stone-300 font-semibold text-xs">Usuário</TableHead>
            <TableHead className="text-stone-300 font-semibold text-xs">Papel</TableHead>
            <TableHead className="text-stone-300 font-semibold text-xs">Status</TableHead>
            <TableHead className="text-stone-300 font-semibold text-xs">Data da Solicitação</TableHead>
            <TableHead className="text-stone-300 font-semibold text-xs">Aprovado Por</TableHead>
            <TableHead className="text-right text-stone-300 font-semibold text-xs">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-xs text-stone-300">
                Nenhum usuário encontrado para este filtro.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isProcessing = processingId === user.id;

              return (
                <TableRow
                  key={user.id}
                  className="border-stone-800/60 hover:bg-stone-800/40 transition-colors"
                >
                  <TableCell>
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
                          <span className="font-semibold text-stone-100 text-sm">
                            {user.name || "Sem nome"}
                          </span>
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

                  <TableCell className="text-xs text-stone-300">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  <TableCell className="text-xs text-stone-300">
                    {user.approvedBy ? (
                      <span title={user.approvedBy.email}>
                        {user.approvedBy.name || user.approvedBy.email}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status !== UserStatus.APPROVED && (
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleApprove(user.id, user.name)}
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
                          onClick={() => handleReject(user.id, user.name)}
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
                          onClick={() => handleToggleRole(user.id, user.role, user.name)}
                          className="h-8 px-2.5 rounded-lg border-stone-700 bg-stone-800/40 text-stone-300 hover:bg-stone-800 text-xs gap-1.5 cursor-pointer disabled:opacity-30"
                          title={isSelf ? "Você não pode alterar seu próprio papel" : "Alternar papel"}
                        >
                          <Shield className="h-3.5 w-3.5 text-amber-400" />
                          {user.role === UserRole.ADMIN ? "Rebaixar" : "Tornar Admin"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
