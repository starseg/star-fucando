import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DataTableIconActionProps } from "./data-table.types";

const VARIANT_CLASS: Record<"default" | "danger", string> = {
  default: "text-stone-400 hover:text-stone-100 hover:bg-stone-800",
  danger: "text-stone-400 hover:text-red-400 hover:bg-red-400/10",
};

export function DataTableIconAction({
  icon: Icon,
  onClick,
  variant = "default",
  disabled = false,
  title,
}: DataTableIconActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn("h-8 w-8 rounded-lg", VARIANT_CLASS[variant])}
    >
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}
