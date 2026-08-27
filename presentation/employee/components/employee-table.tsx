"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Edit2, Trash2, User, Building, Briefcase } from "lucide-react";
import { deleteEmployee } from "@/application/employee/employee-actions";
import { toast } from "sonner";

export interface EmployeeData {
  id: string;
  name: string;
  department: string | null;
  role: string | null;
  admissionDate: Date | string | null;
  createdAt: Date | string;
  _count?: {
    transportVoucher: number;
    mealVoucher: number;
    attendanceAward: number;
  };
}

interface EmployeeTableProps {
  employees: EmployeeData[];
  onEdit: (employee: EmployeeData) => void;
  onRefresh: () => void;
}

export function EmployeeTable({ employees, onEdit, onRefresh }: EmployeeTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o colaborador "${name}"? Todos os lançamentos vinculados também serão removidos.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteEmployee(id);
      if (res.success) {
        toast.success("Colaborador removido com sucesso!");
        onRefresh();
      } else {
        toast.error(res.error || "Erro ao remover colaborador.");
      }
    } catch {
      toast.error("Erro inesperado ao excluir colaborador.");
    } finally {
      setDeletingId(null);
    }
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-800 bg-stone-900/40 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800 text-stone-400 mb-3">
          <User className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-stone-200">Nenhum colaborador encontrado</h3>
        <p className="mt-1 text-sm text-stone-400 max-w-sm">
          Cadastre novos colaboradores para gerenciar vales transporte, alimentação e prêmios de assiduidade.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/70 backdrop-blur overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-stone-950/60">
          <TableRow className="border-stone-800 hover:bg-transparent">
            <TableHead className="text-stone-400 font-semibold">Nome</TableHead>
            <TableHead className="text-stone-400 font-semibold">Departamento</TableHead>
            <TableHead className="text-stone-400 font-semibold">Cargo</TableHead>
            <TableHead className="text-stone-400 font-semibold">Data Admissão</TableHead>
            <TableHead className="text-stone-400 font-semibold text-center">Benefícios Lançados</TableHead>
            <TableHead className="text-stone-400 font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow
              key={employee.id}
              className="border-stone-800/80 hover:bg-stone-800/40 transition-colors"
            >
              <TableCell className="font-medium text-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-100">{employee.name}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-stone-300">
                {employee.department ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building className="h-3.5 w-3.5 text-stone-300" />
                    <span>{employee.department}</span>
                  </div>
                ) : (
                  <span className="text-stone-400 text-xs">-</span>
                )}
              </TableCell>
              <TableCell className="text-stone-300">
                {employee.role ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Briefcase className="h-3.5 w-3.5 text-stone-300" />
                    <span>{employee.role}</span>
                  </div>
                ) : (
                  <span className="text-stone-400 text-xs">-</span>
                )}
              </TableCell>
              <TableCell className="text-stone-300 text-xs">
                {formatDate(employee.admissionDate)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {employee._count && (
                    <>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] bg-amber-500/5">
                        VT: {employee._count.transportVoucher}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] bg-emerald-500/5">
                        VA: {employee._count.mealVoucher}
                      </Badge>
                      <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px] bg-sky-500/5">
                        Assid.: {employee._count.attendanceAward}
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(employee)}
                    className="h-8 w-8 text-stone-400 hover:text-amber-400 hover:bg-amber-400/10"
                    title="Editar colaborador"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id, employee.name)}
                    disabled={deletingId === employee.id}
                    className="h-8 w-8 text-stone-400 hover:text-red-400 hover:bg-red-400/10"
                    title="Excluir colaborador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
