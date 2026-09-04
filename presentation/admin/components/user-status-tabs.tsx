"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStatus } from "@prisma/client";

interface UserStatusCounts {
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface UserStatusTabsProps {
  status?: UserStatus;
  counts: UserStatusCounts;
}

const TAB_TRIGGER_CLASS =
  "text-xs data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400 font-medium rounded-lg";

export function UserStatusTabs({ status, counts }: UserStatusTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={status ?? "ALL"} onValueChange={updateStatusFilter} className="w-full sm:w-auto">
      <TabsList className="bg-stone-900 border border-stone-800 p-1 rounded-xl">
        <TabsTrigger value="ALL" className={TAB_TRIGGER_CLASS}>
          Todos ({counts.total})
        </TabsTrigger>
        <TabsTrigger value={UserStatus.PENDING} className={TAB_TRIGGER_CLASS}>
          Pendentes ({counts.pendingCount})
        </TabsTrigger>
        <TabsTrigger value={UserStatus.APPROVED} className={TAB_TRIGGER_CLASS}>
          Aprovados ({counts.approvedCount})
        </TabsTrigger>
        <TabsTrigger value={UserStatus.REJECTED} className={TAB_TRIGGER_CLASS}>
          Rejeitados ({counts.rejectedCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
