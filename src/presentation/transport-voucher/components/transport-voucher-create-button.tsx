"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransportVoucherDialog } from "./transport-voucher-dialog";

interface TransportVoucherCreateButtonProps {
  defaultMonth: number;
  defaultYear: number;
}

export function TransportVoucherCreateButton({ defaultMonth, defaultYear }: TransportVoucherCreateButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 rounded-xl h-10 px-4"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Novo Lançamento
      </Button>

      <TransportVoucherDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => router.refresh()}
        voucherToEdit={null}
        defaultMonth={defaultMonth}
        defaultYear={defaultYear}
      />
    </>
  );
}
