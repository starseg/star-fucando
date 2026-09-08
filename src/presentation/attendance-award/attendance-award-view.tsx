import * as React from "react";
import { AttendanceAwardTable } from "./components/attendance-award-table";
import { AttendanceAwardCreateButton } from "./components/attendance-award-create-button";
import { AttendanceAwardCopyButton } from "./components/attendance-award-copy-button";
import { MonthNavigatorUrl } from "@/presentation/shared/month-navigator-url";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { Award, Users, DollarSign, Trophy } from "lucide-react";
import { getAttendanceAwardsPage } from "@/use-cases/attendance-award/use-cases/get-attendance-awards-page";
import { formatCurrency } from "@/lib/utils";

interface AttendanceAwardViewProps {
  searchQuery?: string;
  month: number;
  year: number;
  page?: number;
}

export async function AttendanceAwardView({ searchQuery, month, year, page = 1 }: AttendanceAwardViewProps) {
  const result = await getAttendanceAwardsPage({ search: searchQuery, month, year, page });
  const awards = result.success ? result.data ?? [] : [];
  const pagination = result.success ? result.pagination : undefined;
  const stats = result.success
    ? result.stats ?? { totalBonusSum: 0, employeesCount: 0, averageBonus: 0 }
    : { totalBonusSum: 0, employeesCount: 0, averageBonus: 0 };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Award className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Prêmio Assiduidade</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Controle de bonificações por pontualidade e emissão de recibos de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MonthNavigatorUrl month={month} year={year} />
          <AttendanceAwardCopyButton targetMonth={month} targetYear={year} />
          <AttendanceAwardCreateButton defaultMonth={month} defaultYear={year} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total em Premiações"
          value={formatCurrency(stats.totalBonusSum)}
          subtitle="Valor total distribuído no mês"
          icon={DollarSign}
          color="sky"
        />
        <StatsCard
          title="Colaboradores Premiados"
          value={`${stats.employeesCount} pessoas`}
          subtitle="Cumpriram 100% da assiduidade"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Média por Colaborador"
          value={formatCurrency(stats.averageBonus)}
          subtitle="Ticket médio da bonificação"
          icon={Trophy}
          color="sky"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <EntitySearchBar initialQuery={searchQuery} placeholder="Buscar por nome, cargo ou departamento..." />
        <RefreshButton />
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar prêmios de assiduidade."}
        </div>
      )}

      <AttendanceAwardTable awards={awards} month={month} year={year} />

      {pagination && <DataTablePagination page={pagination.page} totalPages={pagination.totalPages} />}
    </div>
  );
}
