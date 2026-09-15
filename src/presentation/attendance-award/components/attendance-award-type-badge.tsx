import * as React from "react";
import type { AttendanceAwardType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

interface AttendanceAwardTypeBadgeProps {
  type: AttendanceAwardType;
}

export function AttendanceAwardTypeBadge({ type }: AttendanceAwardTypeBadgeProps) {
  if (type === "INTEGRAL") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 px-2.5 py-1 font-semibold text-xs inline-flex items-center"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Integral
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 px-2.5 py-1 font-semibold text-xs inline-flex items-center"
    >
      <Clock className="h-3.5 w-3.5" />
      Parcial
    </Badge>
  );
}
