import * as React from "react";

interface DataTableActionsProps {
  children: React.ReactNode;
}

export function DataTableActions({ children }: DataTableActionsProps) {
  return <div className="flex items-center justify-end gap-1.5">{children}</div>;
}
