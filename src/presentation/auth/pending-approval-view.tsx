"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Clock, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PendingApprovalView() {
  const { data: session } = useSession();
  const user = session?.user;
  const isRejected = user?.status === "REJECTED";

  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg",
              isRejected
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10"
            )}
          >
            {isRejected ? (
              <XCircle className="h-8 w-8 text-rose-400" />
            ) : (
              <Clock className="h-8 w-8 text-amber-500" />
            )}
          </div>

          <h1 className="mt-5 text-xl font-bold tracking-tight text-stone-100">
            {isRejected ? "Acesso Não Aprovado" : "Aguardando Aprovação"}
          </h1>

          {user?.email && (
            <div className="mt-2 inline-block rounded-lg bg-stone-800/80 px-3 py-1 text-xs font-mono text-stone-300 border border-stone-700/50">
              {user.email}
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-stone-400">
            {isRejected
              ? "Sua solicitação de acesso foi recusada por um administrador. Caso acredite que isso é um equívoco, entre em contato com a equipe de TI ou Recursos Humanos."
              : "Sua conta foi registrada com sucesso, mas o acesso ao sistema requer aprovação prévia de um administrador. Assim que liberado, você poderá acessar todos os módulos."}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full h-11 rounded-xl border-stone-700 bg-stone-800/50 text-stone-200 hover:bg-stone-800 hover:text-stone-100 transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>

        <div className="mt-6 border-t border-stone-800/80 pt-4 text-center">
          <span className="text-[11px] text-stone-300">
            Star Seg Recibos & Benefícios
          </span>
        </div>
      </div>
    </div>
  );
}
