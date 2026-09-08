import * as React from "react";
import { UserStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  switch (status) {
    case UserStatus.APPROVED:
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprovado
        </Badge>
      );
    case UserStatus.PENDING:
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          Pendente
        </Badge>
      );
    case UserStatus.REJECTED:
      return (
        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1.5 py-1 px-2.5 font-semibold">
          <XCircle className="h-3.5 w-3.5" />
          Rejeitado
        </Badge>
      );
  }
}
