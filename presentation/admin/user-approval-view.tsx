import * as React from "react";
import { UserApprovalTable } from "./components/user-approval-table";
import { UserStatusTabs } from "./components/user-status-tabs";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getUsersPage } from "@/application/user/user-actions";
import { UserStatus } from "@prisma/client";

interface UserApprovalViewProps {
  searchQuery?: string;
  status?: UserStatus;
  page?: number;
}

export async function UserApprovalView({ searchQuery, status, page = 1 }: UserApprovalViewProps) {
  const result = await getUsersPage({ search: searchQuery, status, page });
  const users = result.success ? result.data ?? [] : [];
  const pagination = result.success ? result.pagination : undefined;
  const stats = result.success
    ? result.stats ?? { total: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 }
    : { total: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Aprovações de Acesso</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Gerencie os usuários do domínio @starseg.com e aprove novas solicitações de acesso.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Pendentes de Aprovação"
          value={`${stats.pendingCount} usuários`}
          subtitle="Aguardando liberação de acesso"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Acessos Liberados"
          value={`${stats.approvedCount} usuários`}
          subtitle="Com permissão ativa no sistema"
          icon={CheckCircle2}
          color="sky"
        />
        <StatsCard
          title="Solicitações Recusadas"
          value={`${stats.rejectedCount} usuários`}
          subtitle="Acessos bloqueados"
          icon={XCircle}
          color="stone"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <UserStatusTabs status={status} counts={stats} />

        <div className="flex w-full sm:w-auto items-center gap-3">
          <EntitySearchBar initialQuery={searchQuery} placeholder="Filtrar por nome ou email..." />
          <RefreshButton />
        </div>
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar usuários."}
        </div>
      )}

      <UserApprovalTable users={users} currentUserId={result.success ? result.currentUserId : undefined} />

      {pagination && <DataTablePagination page={pagination.page} totalPages={pagination.totalPages} />}
    </div>
  );
}
