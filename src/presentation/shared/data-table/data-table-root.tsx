import * as React from "react";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DataTableRoot({ className, children, ...props }: DataTableRootProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-800/90 bg-[#12100e]/80 backdrop-blur-md overflow-hidden shadow-sm",
        className,
      )}
      {...props}
    >
      <Table>{children}</Table>
    </div>
  );
}
