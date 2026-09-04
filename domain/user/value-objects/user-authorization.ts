import type { UserRole, UserStatus } from "@prisma/client";

export interface SessionUser {
  id: string;
  role: UserRole;
  status: UserStatus;
}

export function isApprovedUser(user: SessionUser | null | undefined): user is SessionUser {
  return !!user && user.status === "APPROVED";
}

export function isAdminUser(user: SessionUser | null | undefined): user is SessionUser {
  return isApprovedUser(user) && user.role === "ADMIN";
}
