"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/presentation/shared/hooks/use-debounced-value";

interface EmployeeSearchBarProps {
  initialQuery?: string;
}

export function EmployeeSearchBar({ initialQuery = "" }: EmployeeSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [syncedQuery, setSyncedQuery] = React.useState(initialQuery);
  const [value, setValue] = React.useState(initialQuery);

  if (initialQuery !== syncedQuery) {
    setSyncedQuery(initialQuery);
    setValue(initialQuery);
  }

  const debouncedValue = useDebouncedValue(value, 300);

  React.useEffect(() => {
    if (debouncedValue === syncedQuery) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
      <Input
        placeholder="Buscar por nome, cargo ou departamento..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10 bg-stone-900/80 border-stone-800 text-stone-100 h-10 rounded-xl placeholder:text-stone-300"
      />
    </div>
  );
}
