import * as React from "react";
import { RefreshCw } from "lucide-react";

interface DataTableLoadingStateProps {
  label: string;
}

export function DataTableLoadingState({ label }: DataTableLoadingStateProps) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40">
      <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
      <span className="ml-3 text-xs text-stone-400">{label}</span>
    </div>
  );
}
