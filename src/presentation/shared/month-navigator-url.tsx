"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MonthNavigator } from "./month-navigator";

interface MonthNavigatorUrlProps {
  month: number;
  year: number;
}

export function MonthNavigatorUrl({ month, year }: MonthNavigatorUrlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateMonthFilter = (newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", String(newMonth));
    params.set("ano", String(newYear));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return <MonthNavigator month={month} year={year} onChange={updateMonthFilter} />;
}
