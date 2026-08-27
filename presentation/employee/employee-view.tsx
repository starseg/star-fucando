"use client";

import * as React from "react";
import { EmployeeTable, EmployeeData } from "./components/employee-table";
import { EmployeeDialog } from "./components/employee-dialog";
import { StatsCard } from "@/presentation/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, Building, ShieldCheck, RefreshCw } from "lucide-react";
import { getEmployees } from "@/application/employee/employee-actions";
import { toast } from "sonner";

export function EmployeeView() {
  const [employees, setEmployees] = React.useState<EmployeeData[]>([]);
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<EmployeeData | null>(null);

  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getEmployees(search);
      if (res.success && res.data) {
        setEmployees(res.data as unknown as EmployeeData[]);
      } else {
        toast.error(res.error || "Erro ao carregar colaboradores.");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  // Departamentos únicos
  const departmentsCount = React.useMemo(() => {
    const deps = new Set(employees.map((e) => e.department).filter(Boolean));
    return deps.size || 1;
  }, [employees]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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

        <Button
          onClick={handleOpenCreate}
          className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 rounded-xl h-10 px-4"
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Colaboradores Ativos"
          value={`${employees.length} pessoas`}
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
        <StatsCard
          title="Status do Sistema"
          value="100% Regular"
          subtitle="Benefícios sincronizados"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Barra de Busca e Ações */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
          <Input
            placeholder="Buscar por nome, cargo ou departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-stone-900/80 border-stone-800 text-stone-100 h-10 rounded-xl placeholder:text-stone-300"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => fetchEmployees()}
          disabled={isLoading}
          className="border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-300 h-10 px-4 rounded-xl"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Tabela de Colaboradores */}
      {isLoading && employees.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-3 text-xs text-stone-400">Carregando colaboradores...</span>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          onEdit={handleOpenEdit}
          onRefresh={fetchEmployees}
        />
      )}

      {/* Diálogo */}
      <EmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchEmployees}
        employeeToEdit={selectedEmployee}
      />
    </div>
  );
}
