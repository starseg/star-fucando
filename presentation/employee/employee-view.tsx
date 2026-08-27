"use client";

import * as React from "react";
import { EmployeeTable, EmployeeData } from "./components/employee-table";
import { EmployeeDialog } from "./components/employee-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users, RefreshCw } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Colaboradores</h1>
          </div>
          <p className="mt-1 text-sm text-stone-400">
            Gerencie os colaboradores da Star Seg e seus vínculos de benefícios.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-semibold shadow-md shadow-amber-500/10"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Buscar por nome, departamento ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-stone-900/60 border-stone-800 text-stone-100 placeholder:text-stone-300"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => fetchEmployees()}
          disabled={isLoading}
          className="border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Content */}
      {isLoading && employees.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-3 text-sm text-stone-400">Carregando colaboradores...</span>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          onEdit={handleOpenEdit}
          onRefresh={fetchEmployees}
        />
      )}

      {/* Dialog */}
      <EmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchEmployees}
        employeeToEdit={selectedEmployee}
      />
    </div>
  );
}
