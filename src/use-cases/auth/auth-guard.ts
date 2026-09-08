"use server";

import { cache } from "react";
import { auth } from "@/auth";
import { isApprovedUser, isAdminUser } from "@/domain/user/value-objects/user-authorization";
import { UnauthorizedAccessError, ForbiddenAdminAccessError } from "@/domain/user/errors/user-errors";

const getSession = cache(auth);

export async function requireApprovedUser() {
  const session = await getSession();
  if (!isApprovedUser(session?.user)) {
    return { ok: false as const, error: new UnauthorizedAccessError().message };
  }
  // isApprovedUser only returns true when both session and session.user exist,
  // so TS narrows session itself (not just session?.user) past this guard.
  return { ok: true as const, user: session.user };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!isAdminUser(session?.user)) {
    return { ok: false as const, error: new ForbiddenAdminAccessError().message };
  }
  return { ok: true as const, user: session.user };
}
