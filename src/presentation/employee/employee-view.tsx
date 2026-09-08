import * as React from "react";
import { EmployeeTable } from "./components/employee-table";
import { EmployeeCreateButton } from "./components/employee-create-button";
import { EntitySearchBar } from "@/presentation/shared/entity-search-bar";
import { StatsCard } from "@/presentation/shared/stats-card";
import { RefreshButton } from "@/presentation/shared/refresh-button";
import { DataTablePagination } from "@/presentation/shared/data-table-pagination";
import { Users, Building } from "lucide-react";
import { getEmployeesPage } from "@/use-cases/employee/use-cases/get-employees-page";

interface EmployeeViewProps {
  searchQuery?: string;
  page?: number;
}

export async function EmployeeView({ searchQuery, page = 1 }: EmployeeViewProps) {
  const result = await getEmployeesPage({ search: searchQuery, page });
  const employees = result.success ? result.data ?? [] : [];
  const pagination = result.success ? result.pagination : undefined;
  const departmentsCount = result.success ? result.stats?.departmentsCount ?? 1 : 1;
  const totalEmployees = pagination?.total ?? employees.length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Colaboradores</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Cadastro unificado da equipe para gestão de benefícios e emissão de recibos.
          </p>
        </div>

        <EmployeeCreateButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Colaboradores Ativos"
          value={`${totalEmployees} pessoas`}
          subtitle="Equipe cadastrada no sistema"
          icon={Users}
          color="amber"
        />
        <StatsCard
          title="Departamentos"
          value={`${departmentsCount} setores`}
          subtitle="Setores operacionais e administrativos"
          icon={Building}
          color="stone"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <EntitySearchBar initialQuery={searchQuery} placeholder="Buscar por nome, cargo ou departamento..." />
        <RefreshButton />
      </div>

      {!result.success && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {result.error || "Falha ao carregar colaboradores."}
        </div>
      )}

      <EmployeeTable employees={employees} />

      {pagination && <DataTablePagination page={pagination.page} totalPages={pagination.totalPages} />}
    </div>
  );
}
