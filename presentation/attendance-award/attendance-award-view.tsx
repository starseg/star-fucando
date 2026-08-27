"use client";

import * as React from "react";
import { AttendanceAwardTable, AttendanceAwardData } from "./components/attendance-award-table";
import { AttendanceAwardDialog } from "./components/attendance-award-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, Plus, Printer, RefreshCw } from "lucide-react";
import { getAttendanceAwards } from "@/application/attendance-award/attendance-award-actions";
import { toast } from "sonner";

export function AttendanceAwardView() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentDate.getFullYear());

  const [awards, setAwards] = React.useState<AttendanceAwardData[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [awardToEdit, setAwardToEdit] = React.useState<AttendanceAwardData | null>(null);

  const fetchAwards = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAttendanceAwards(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setAwards(res.data as unknown as AttendanceAwardData[]);
        setSelectedIds([]);
      } else {
        toast.error(res.error || "Erro ao carregar prêmios de assiduidade.");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  React.useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (allSelected: boolean) => {
    if (allSelected) {
      setSelectedIds(awards.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleOpenCreate = () => {
    setAwardToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (award: AttendanceAwardData) => {
    setAwardToEdit(award);
    setIsDialogOpen(true);
  };

  const handlePrint = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    const url = `/imprimir?tipo=assiduidade&ids=${ids.join(",")}`;
    window.open(url, "_blank");
  };

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-sky-500" />
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Prêmio Assiduidade</h1>
          </div>
          <p className="mt-1 text-sm text-stone-400">
            Lançamentos de premiações por assiduidade e emissão de recibos de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => handlePrint(selectedIds)}
            disabled={selectedIds.length === 0}
            className="border-sky-500/40 text-sky-400 hover:bg-sky-500/10 font-medium"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Selecionados ({selectedIds.length})
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-sky-500 text-stone-950 hover:bg-sky-400 font-semibold shadow-md shadow-sky-500/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Competência:
          </span>
          <Select
            value={String(selectedMonth)}
            onValueChange={(val) => setSelectedMonth(Number(val))}
          >
            <SelectTrigger className="w-[140px] bg-stone-950 border-stone-800 text-stone-100 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(selectedYear)}
            onValueChange={(val) => setSelectedYear(Number(val))}
          >
            <SelectTrigger className="w-[100px] bg-stone-950 border-stone-800 text-stone-100 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchAwards()}
          disabled={isLoading}
          className="text-stone-400 hover:text-stone-100"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar Lançamentos
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
          <span className="ml-3 text-sm text-stone-400">Carregando prêmios de assiduidade...</span>
        </div>
      ) : (
        <AttendanceAwardTable
          awards={awards}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEdit={handleOpenEdit}
          onRefresh={fetchAwards}
          onPrint={handlePrint}
        />
      )}

      {/* Dialog */}
      <AttendanceAwardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchAwards}
        awardToEdit={awardToEdit}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />
    </div>
  );
}
