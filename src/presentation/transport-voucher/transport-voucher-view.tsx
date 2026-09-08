import * as React from "react";
import { TransportVoucherTable } from "./components/transport-voucher-table";
import { TransportVoucherCreateButton } from "./components/transport-voucher-create-button";
import { TransportVoucherCopyButton } from "./components/transport-voucher-copy-button";
import { MonthNavigatorUrl } from "@/presentation/shared/month-navigator-url";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { Bus, Users, Ticket, DollarSign } from "lucide-react";
import { getTransportVouchersPage } from "@/use-cases/transport-voucher/use-cases/get-transport-vouchers-page";
import { formatCurrency } from "@/lib/utils";

interface TransportVoucherViewProps {
  searchQuery?: string;
  month: number;
  year: number;
  page?: number;
}

export async function TransportVoucherView({
  searchQuery,
  month,
  year,
  page = 1,
}: TransportVoucherViewProps) {
  const result = await getTransportVouchersPage({
    search: searchQuery,
    month,
    year,
    page,
  });
  const vouchers = result.success ? (result.data ?? []) : [];
  const pagination = result.success ? result.pagination : undefined;
  const stats = result.success
    ? (result.stats ?? {
        totalValueSum: 0,
        employeesCount: 0,
        totalVouchersCount: 0,
      })
    : { totalValueSum: 0, employeesCount: 0, totalVouchersCount: 0 };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bus className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">
              Vale Transporte
            </h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Lançamentos, controle de tarifas e emissão simplificada de recibos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <MonthNavigatorUrl month={month} year={year} />
          <TransportVoucherCopyButton targetMonth={month} targetYear={year} />
          <TransportVoucherCreateButton
            defaultMonth={month}
            defaultYear={year}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total em Benefícios"
          value={formatCurrency(stats.totalValueSum)}
          subtitle="Valor total para o mês selecionado"
          icon={DollarSign}
          color="amber"
        />
        <StatsCard
          title="Colaboradores Atendidos"
          value={`${stats.employeesCount} pessoas`}
          subtitle="Com lançamentos no mês"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Total de Vales / Passagens"
          value={`${stats.totalVouchersCount} un.`}
          subtitle="Passagens totais emitidas"
          icon={Ticket}
          color="amber"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <EntitySearchBar
          initialQuery={searchQuery}
          placeholder="Buscar por nome, cargo ou departamento..."
        />
        <RefreshButton />
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar vales transporte."}
        </div>
      )}

      <TransportVoucherTable vouchers={vouchers} month={month} year={year} />

      {pagination && (
        <DataTablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
}
