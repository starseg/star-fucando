"use client";

import * as React from "react";
import { UserApprovalTable, UserApprovalItem } from "./components/user-approval-table";
import { StatsCard } from "@/presentation/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { getUsers } from "@/application/user/user-actions";
import { UserStatus } from "@prisma/client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function UserApprovalView() {
  const { data: session } = useSession();
  const [users, setUsers] = React.useState<UserApprovalItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const filter = statusFilter === "ALL" ? undefined : (statusFilter as UserStatus);
      const res = await getUsers(filter);
      if (res.success && res.data) {
        setUsers(res.data as unknown as UserApprovalItem[]);
      } else {
        toast.error(res.error || "Erro ao carregar lista de usuários.");
      }
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Contagens para os cards
  const pendingCount = React.useMemo(
    () => users.filter((u) => u.status === UserStatus.PENDING).length,
    [users]
  );
  const approvedCount = React.useMemo(
    () => users.filter((u) => u.status === UserStatus.APPROVED).length,
    [users]
  );
  const rejectedCount = React.useMemo(
    () => users.filter((u) => u.status === UserStatus.REJECTED).length,
    [users]
  );

  // Filtragem local por busca (nome / email)
  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(s) ||
        (u.name && u.name.toLowerCase().includes(s))
    );
  }, [users, search]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-100">
              Aprovações de Acesso
            </h1>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Gerencie os usuários do domínio @starseg.com e aprove novas solicitações de acesso.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchUsers()}
          disabled={isLoading}
          className="border-stone-800 bg-stone-900/80 hover:bg-stone-800 text-stone-300 h-10 px-4 rounded-xl self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar Lista
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Pendentes de Aprovação"
          value={`${pendingCount} usuários`}
          subtitle="Aguardando liberação de acesso"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Acessos Liberados"
          value={`${approvedCount} usuários`}
          subtitle="Com permissão ativa no sistema"
          icon={CheckCircle2}
          color="sky"
        />
        <StatsCard
          title="Solicitações Recusadas"
          value={`${rejectedCount} usuários`}
          subtitle="Acessos bloqueados"
          icon={XCircle}
          color="stone"
        />
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-stone-900 border border-stone-800 p-1 rounded-xl">
            <TabsTrigger
              value="ALL"
              className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 font-medium rounded-lg"
            >
              Todos ({users.length})
            </TabsTrigger>
            <TabsTrigger
              value="PENDING"
              className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 font-medium rounded-lg"
            >
              Pendentes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger
              value="APPROVED"
              className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 font-medium rounded-lg"
            >
              Aprovados ({approvedCount})
            </TabsTrigger>
            <TabsTrigger
              value="REJECTED"
              className="text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 font-medium rounded-lg"
            >
              Rejeitados ({rejectedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <Input
            placeholder="Filtrar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-stone-900/80 border-stone-800 text-stone-100 h-10 rounded-xl placeholder:text-stone-500 text-xs"
          />
        </div>
      </div>

      {/* Tabela */}
      {isLoading && users.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-3 text-xs text-stone-400">Carregando usuários...</span>
        </div>
      ) : (
        <UserApprovalTable
          users={filteredUsers}
          currentUserId={session?.user?.id}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  );
}
