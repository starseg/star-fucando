import type { UserRole, UserStatus } from "@prisma/client";

export interface UserAccount {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  approvedAt: Date | null;
  approvedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}
