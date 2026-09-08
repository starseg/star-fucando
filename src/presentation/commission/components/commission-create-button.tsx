"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CommissionDialog } from "./commission-dialog";

interface CommissionCreateButtonProps {
  defaultMonth: number;
  defaultYear: number;
}

export function CommissionCreateButton({ defaultMonth, defaultYear }: CommissionCreateButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-violet-500 text-stone-950 hover:bg-violet-400 font-bold shadow-md shadow-violet-500/20 rounded-xl h-10 px-4"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Nova Comissão
      </Button>

      <CommissionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => router.refresh()}
        commissionToEdit={null}
        defaultMonth={defaultMonth}
        defaultYear={defaultYear}
      />
    </>
  );
}
