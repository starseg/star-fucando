import * as React from "react";
import { MealVoucherTable } from "./components/meal-voucher-table";
import { MealVoucherCreateButton } from "./components/meal-voucher-create-button";
import { MealVoucherCopyButton } from "./components/meal-voucher-copy-button";
import { MonthNavigatorUrl } from "@/presentation/shared/month-navigator-url";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { Utensils, Users, DollarSign, CalendarCheck } from "lucide-react";
import { getMealVouchersPage } from "@/application/meal-voucher/meal-voucher-actions";
import { formatCurrency } from "@/lib/utils";

interface MealVoucherViewProps {
  searchQuery?: string;
  month: number;
  year: number;
  page?: number;
}

export async function MealVoucherView({ searchQuery, month, year, page = 1 }: MealVoucherViewProps) {
  const result = await getMealVouchersPage({ search: searchQuery, month, year, page });
  const vouchers = result.success ? result.data ?? [] : [];
  const pagination = result.success ? result.pagination : undefined;
  const stats = result.success
    ? result.stats ?? { totalNetSum: 0, employeesCount: 0, totalDaysSum: 0 }
    : { totalNetSum: 0, employeesCount: 0, totalDaysSum: 0 };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Utensils className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Vale Alimentação</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Controle de diárias, coparticipações e emissão de recibos de alimentação/refeição.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MonthNavigatorUrl month={month} year={year} />
          <MealVoucherCopyButton targetMonth={month} targetYear={year} />
          <MealVoucherCreateButton defaultMonth={month} defaultYear={year} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Líquido Consolidado"
          value={formatCurrency(stats.totalNetSum)}
          subtitle="Valor total a pagar no mês"
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Colaboradores Atendidos"
          value={`${stats.employeesCount} pessoas`}
          subtitle="Com créditos de alimentação"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Total de Diárias Pagas"
          value={`${stats.totalDaysSum} dias`}
          subtitle="Soma de dias trabalhados"
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <EntitySearchBar initialQuery={searchQuery} placeholder="Buscar por nome, cargo ou departamento..." />
        <RefreshButton />
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar vales alimentação."}
        </div>
      )}

      <MealVoucherTable vouchers={vouchers} month={month} year={year} />

      {pagination && <DataTablePagination page={pagination.page} totalPages={pagination.totalPages} />}
    </div>
  );
}
