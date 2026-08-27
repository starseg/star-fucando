"use client";

import * as React from "react";
import { AttendanceAwardTable, AttendanceAwardData } from "./components/attendance-award-table";
import { AttendanceAwardDialog } from "./components/attendance-award-dialog";
import { MonthNavigator } from "@/presentation/shared/month-navigator";
import { StatsCard } from "@/presentation/shared/stats-card";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { Button } from "@/components/ui/button";
import { Award, Plus, Users, DollarSign, Trophy, RefreshCw } from "lucide-react";
import { getAttendanceAwards } from "@/application/attendance-award/attendance-award-actions";
import { formatCurrency } from "@/lib/utils";
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

  const totalBonusSum = awards.reduce((acc, a) => acc + Number(a.bonusValue), 0);
  const averageBonus = awards.length > 0 ? totalBonusSum / awards.length : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Navegação de Mês */}
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
          <MonthNavigator
            month={selectedMonth}
            year={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />

          <Button
            onClick={handleOpenCreate}
            className="bg-sky-500 text-stone-950 hover:bg-sky-400 font-bold shadow-md shadow-sky-500/20 rounded-xl h-10 px-4"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Bonificação
          </Button>
        </div>
      </div>

      {/* Métricas do Mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total em Premiações"
          value={formatCurrency(totalBonusSum)}
          subtitle="Valor total distribuído no mês"
          icon={DollarSign}
          color="sky"
        />
        <StatsCard
          title="Colaboradores Premiados"
          value={`${awards.length} pessoas`}
          subtitle="Cumpriram 100% da assiduidade"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Média por Colaborador"
          value={formatCurrency(averageBonus)}
          subtitle="Ticket médio da bonificação"
          icon={Trophy}
          color="sky"
        />
      </div>

      {/* Tabela de Lançamentos */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
          <span className="ml-3 text-xs text-stone-400">Carregando premiações...</span>
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

      {/* Diálogo de Cadastro / Edição */}
      <AttendanceAwardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchAwards}
        awardToEdit={awardToEdit}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />

      {/* Barra Flutuante de Ação em Lote */}
      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={awards.length}
        onPrint={() => handlePrint(selectedIds)}
        onClear={() => setSelectedIds([])}
        benefitType="Prêmio de Assiduidade"
      />
    </div>
  );
}
