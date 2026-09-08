import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const user = req.auth?.user;
  const pathname = nextUrl.pathname;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isPendingPage = pathname === "/aguardando-aprovacao";
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Se não estiver logado
  if (!isLoggedIn) {
    if (isLoginPage || isPendingPage) {
      return NextResponse.next();
    }
    if (isApiRoute) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }
    const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // Usuário está logado
  const isApproved = user?.status === "APPROVED";
  const isAdmin = user?.role === "ADMIN";

  // Se logado mas NÃO aprovado (PENDING ou REJECTED)
  if (!isApproved) {
    if (isPendingPage) {
      return NextResponse.next();
    }
    if (isApiRoute) {
      return NextResponse.json({ error: "Conta aguardando aprovação." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/aguardando-aprovacao", nextUrl));
  }

  // Usuário está logado e APROVADO tentando acessar login ou aguardando-aprovação
  if (isLoginPage || isPendingPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Se tentar rota /admin/* e não for ADMIN
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
