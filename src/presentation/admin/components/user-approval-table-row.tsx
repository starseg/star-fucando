import * as React from "react";
import Image from "next/image";
import { UserRole, UserStatus } from "@prisma/client";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, UserX, User as UserIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DataTable } from "@/presentation/shared/data-table";
import { UserStatusBadge } from "./user-status-badge";
import type { UserApprovalItem } from "./user-approval-table";

interface UserApprovalTableRowProps {
  user: UserApprovalItem;
  isSelf: boolean;
  isProcessing: boolean;
  onApprove: (user: UserApprovalItem) => void;
  onReject: (user: UserApprovalItem) => void;
  onToggleRole: (user: UserApprovalItem) => void;
}

export function UserApprovalTableRow({
  user,
  isSelf,
  isProcessing,
  onApprove,
  onReject,
  onToggleRole,
}: UserApprovalTableRowProps) {
  return (
    <DataTable.Row>
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

      <TableCell>
        <UserStatusBadge status={user.status} />
      </TableCell>

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
              onClick={() => onApprove(user)}
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
              onClick={() => onReject(user)}
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
              onClick={() => onToggleRole(user)}
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
}
