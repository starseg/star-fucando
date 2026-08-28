"use client";

import * as React from "react";
import { TransportVoucherTable, TransportVoucherData } from "./components/transport-voucher-table";
import { TransportVoucherDialog } from "./components/transport-voucher-dialog";
import { CopyPreviousMonthDialog } from "@/presentation/shared/copy-previous-month-dialog";
import { MonthNavigator } from "@/presentation/shared/month-navigator";
import { StatsCard } from "@/presentation/shared/stats-card";
import { SelectionActionBar } from "@/presentation/shared/selection-action-bar";
import { Button } from "@/components/ui/button";
import { Bus, Plus, Users, Ticket, DollarSign, RefreshCw, Copy } from "lucide-react";
import {
  getTransportVouchers,
  copyTransportVouchers,
} from "@/application/transport-voucher/transport-voucher-actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function TransportVoucherView() {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(4);
  const [selectedYear, setSelectedYear] = React.useState<number>(2026);

  const [vouchers, setVouchers] = React.useState<TransportVoucherData[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = React.useState(false);
  const [voucherToEdit, setVoucherToEdit] = React.useState<TransportVoucherData | null>(null);

  const fetchVouchers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getTransportVouchers(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setVouchers(res.data as unknown as TransportVoucherData[]);
        setSelectedIds([]);
      } else {
        toast.error(res.error || "Erro ao carregar vales transporte.");
      }
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  React.useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (allSelected: boolean) => {
    if (allSelected) {
      setSelectedIds(vouchers.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleOpenCreate = () => {
    setVoucherToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (voucher: TransportVoucherData) => {
    setVoucherToEdit(voucher);
    setIsDialogOpen(true);
  };

  const handlePrint = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir.");
      return;
    }
    const url = `/imprimir?tipo=transporte&ids=${ids.join(",")}`;
    window.open(url, "_blank");
  };

  const handlePrintAccounting = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning("Selecione pelo menos um lançamento para imprimir o relatório.");
      return;
    }
    const url = `/imprimir-contabilidade?tipo=transporte&ids=${ids.join(",")}&mes=${selectedMonth}&ano=${selectedYear}`;
    window.open(url, "_blank");
  };

  const totalValueSum = vouchers.reduce((acc, v) => acc + Number(v.totalValue), 0);
  const totalVouchersCount = vouchers.reduce((acc, v) => acc + Number(v.totalVouchers), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Navegação de Mês */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bus className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">Vale Transporte</h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Lançamentos, controle de tarifas e emissão simplificada de recibos.
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
            variant="outline"
            onClick={() => setIsCopyDialogOpen(true)}
            className="border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl h-10 px-3.5 text-xs shadow-sm"
            title="Copiar todos os lançamentos do mês anterior"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
            Copiar Mês Anterior
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 rounded-xl h-10 px-4"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Métricas do Mês */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total em Benefícios"
          value={formatCurrency(totalValueSum)}
          subtitle="Valor total para o mês selecionado"
          icon={DollarSign}
          color="amber"
        />
        <StatsCard
          title="Colaboradores Atendidos"
          value={`${vouchers.length} pessoas`}
          subtitle="Com lançamentos no mês"
          icon={Users}
          color="stone"
        />
        <StatsCard
          title="Total de Vales / Passagens"
          value={`${totalVouchersCount} un.`}
          subtitle="Passagens totais emitidas"
          icon={Ticket}
          color="amber"
        />
      </div>

      {/* Tabela de Lançamentos */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-3 text-xs text-stone-400">Carregando lançamentos...</span>
        </div>
      ) : (
        <TransportVoucherTable
          vouchers={vouchers}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEdit={handleOpenEdit}
          onRefresh={fetchVouchers}
          onPrint={handlePrint}
          onCopyPreviousMonth={() => setIsCopyDialogOpen(true)}
        />
      )}

      {/* Diálogo de Cadastro / Edição */}
      <TransportVoucherDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchVouchers}
        voucherToEdit={voucherToEdit}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />

      {/* Diálogo de Cópia do Mês Anterior */}
      <CopyPreviousMonthDialog
        isOpen={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        onSuccess={fetchVouchers}
        targetMonth={selectedMonth}
        targetYear={selectedYear}
        benefitTitle="Vale Transporte"
        accentColor="amber"
        onCopy={copyTransportVouchers}
      />

      {/* Barra Flutuante de Ação em Lote */}
      <SelectionActionBar
        selectedCount={selectedIds.length}
        totalCount={vouchers.length}
        onPrint={() => handlePrint(selectedIds)}
        onPrintAccounting={() => handlePrintAccounting(selectedIds)}
        onClear={() => setSelectedIds([])}
        benefitType="Vale Transporte"
      />
    </div>
  );
}
