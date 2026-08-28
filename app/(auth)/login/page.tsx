import * as React from "react";
import { LoginView } from "@/presentation/auth/login-view";

export const metadata = {
  title: "Login | Star Seg",
  description: "Acesso corporativo Star Seg.",
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="text-xs text-stone-500">Carregando...</div>}>
      <LoginView />
    </React.Suspense>
  );
}
