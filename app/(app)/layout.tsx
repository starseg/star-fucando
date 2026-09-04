import * as React from "react";
import { AppLayout } from "@/presentation/shared/app-layout";
import { getPendingCount } from "@/application/user/use-cases/get-pending-count";

export default async function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  const pendingCountResult = await getPendingCount();
  const pendingCount = pendingCountResult.success ? pendingCountResult.count ?? 0 : 0;

  return <AppLayout pendingCount={pendingCount}>{children}</AppLayout>;
}
