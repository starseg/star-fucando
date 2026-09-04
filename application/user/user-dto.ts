import { UserStatus } from "@prisma/client";

export interface GetUsersPageParams {
  search?: string;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}
