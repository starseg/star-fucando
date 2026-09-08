"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MealVoucherDialog } from "./meal-voucher-dialog";

interface MealVoucherCreateButtonProps {
  defaultMonth: number;
  defaultYear: number;
}

export function MealVoucherCreateButton({ defaultMonth, defaultYear }: MealVoucherCreateButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-emerald-500 text-stone-950 hover:bg-emerald-400 font-bold shadow-md shadow-emerald-500/20 rounded-xl h-10 px-4"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Novo Lançamento
      </Button>

      <MealVoucherDialog
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
