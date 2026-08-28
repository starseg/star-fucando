"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginView() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header com Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-stone-100">Star Seg</h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
            Recibos & Benefícios
          </p>
          <p className="mt-3 text-xs text-stone-400">
            Acesse com sua conta corporativa para gerenciar colaboradores, benefícios e emitir recibos.
          </p>
        </div>

        {/* Mensagens de Erro */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              {error === "AccessDenied"
                ? "Acesso permitido apenas para contas corporativas @starseg.com."
                : "Ocorreu um erro ao tentar entrar. Tente novamente."}
            </div>
          </div>
        )}

        {/* Botão Google Login */}
        <div className="mt-8">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-stone-100 font-semibold text-stone-950 hover:bg-stone-200 transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {isLoading ? "Entrando..." : "Entrar com Google"}
          </Button>
        </div>

        {/* Rodapé */}
        <div className="mt-8 border-t border-stone-800/80 pt-4 text-center">
          <span className="text-[11px] text-stone-300">
            Acesso restrito à equipe autorizada Star Seg
          </span>
        </div>
      </div>
    </div>
  );
}
