import * as React from "react";
import { CommissionTable } from "./components/commission-table";
import { CommissionCreateButton } from "./components/commission-create-button";
import { CommissionCopyButton } from "./components/commission-copy-button";
import { MonthNavigatorUrl } from "@/presentation/shared/month-navigator-url";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { HandCoins, Users, DollarSign, Trophy } from "lucide-react";
import { getCommissionsPage } from "@/application/commission/use-cases/get-commissions-page";
import { formatCurrency } from "@/lib/utils";

interface CommissionViewProps {
  searchQuery?: string;
  month: number;
  year: number;
  page?: number;
}

export async function CommissionView({ searchQuery, month, year, page = 1 }: CommissionViewProps) {
  const result = await getCommissionsPage({ search: searchQuery, month, year, page });
  const commissions = result.success ? result.data ?? [] : [];
  const pagination = result.success ? result.pagination : undefined;
  const stats = result.success
    ? result.stats ?? { totalCommissionSum: 0, employeesCount: 0, averageCommission: 0 }
    : { totalCommissionSum: 0, employeesCount: 0, averageCommission: 0 };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <HandCoins className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Comissões</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Controle de comissões dos técnicos e emissão de recibos de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MonthNavigatorUrl month={month} year={year} />
          <CommissionCopyButton targetMonth={month} targetYear={year} />
          <CommissionCreateButton defaultMonth={month} defaultYear={year} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total em Comissões"
          value={formatCurrency(stats.totalCommissionSum)}
          subtitle="Valor total distribuído no mês"
          icon={DollarSign}
          color="violet"
        />
        <StatsCard
          title="Técnicos Comissionados"
          value={`${stats.employeesCount} pessoas`}
          subtitle="Com lançamento no mês"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Média por Técnico"
          value={formatCurrency(stats.averageCommission)}
          subtitle="Ticket médio da comissão"
          icon={Trophy}
          color="violet"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <EntitySearchBar initialQuery={searchQuery} placeholder="Buscar por nome, cargo ou departamento..." />
        <RefreshButton />
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar comissões."}
        </div>
      )}

      <CommissionTable commissions={commissions} month={month} year={year} />

      {pagination && <DataTablePagination page={pagination.page} totalPages={pagination.totalPages} />}
    </div>
  );
}
