"use server";

import { cache } from "react";
import { auth } from "@/auth";

const getSession = cache(auth);

export async function requireApprovedUser() {
  const session = await getSession();
  if (!session?.user || session.user.status !== "APPROVED") {
    return { ok: false as const, error: "Acesso não autorizado. Faça login novamente." };
  }
  return { ok: true as const, user: session.user };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.status !== "APPROVED" || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "Acesso restrito para administradores." };
  }
  return { ok: true as const, user: session.user };
}
