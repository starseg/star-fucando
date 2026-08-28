import * as React from "react";
import { AppLayout } from "@/presentation/shared/app-layout";

export default function AuthenticatedAppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
