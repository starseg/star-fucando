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
import { Edit2, Trash2, User } from "lucide-react";
import { deleteEmployee } from "@/application/employee/employee-actions";
import { toast } from "sonner";

export interface EmployeeData {
  id: string;
  name: string;
  pix?: string | null;
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
    if (!confirm(`Excluir o colaborador "${name}"? Todos os lançamentos vinculados a ele também serão removidos.`)) {
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <User className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-stone-200">Nenhum colaborador cadastrado</h3>
        <p className="mt-1 text-xs text-stone-400 max-w-sm">
          Cadastre os funcionários da Star Seg para gerenciar benefícios e emitir recibos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-800/90 bg-[#12100e]/80 backdrop-blur-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-stone-950/80 border-b border-stone-800">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider pl-5">
              Colaborador
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Chave PIX
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Departamento / Função
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider">
              Data de Admissão
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-center">
              Histórico de Benefícios
            </TableHead>
            <TableHead className="text-stone-400 font-semibold text-xs uppercase tracking-wider text-right pr-5 w-28">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow
              key={employee.id}
              className="border-b border-stone-800/60 hover:bg-stone-800/30 transition-colors"
            >
              <TableCell className="pl-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 text-xs font-black border border-amber-500/20">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-stone-100 text-sm block">
                      {employee.name}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono text-stone-300 bg-stone-900/80 border border-stone-800/80 px-2.5 py-1 rounded-md inline-block max-w-[200px] truncate" title={employee.pix || "Não informada"}>
                  {employee.pix || "Não informada"}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-stone-200 block">
                    {employee.role || "Colaborador"}
                  </span>
                  <span className="text-xs text-stone-300">
                    {employee.department || "Operacional"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-xs font-medium text-stone-300">
                {formatDate(employee.admissionDate)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {employee._count && (
                    <>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] bg-amber-500/5 px-2 py-0.5 rounded-md">
                        VT: {employee._count.transportVoucher}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded-md">
                        VA: {employee._count.mealVoucher}
                      </Badge>
                      <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px] bg-sky-500/5 px-2 py-0.5 rounded-md">
                        Assid.: {employee._count.attendanceAward}
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right pr-5">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(employee)}
                    className="h-8 w-8 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg"
                    title="Editar colaborador"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id, employee.name)}
                    disabled={deletingId === employee.id}
                    className="h-8 w-8 text-stone-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                    title="Excluir colaborador"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
