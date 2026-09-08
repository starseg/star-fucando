"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { MealVoucherData } from "./meal-voucher-table";
import { MealVoucherForm } from "./meal-voucher-form";
import { useEmployeeOptions } from "@/presentation/shared/hooks/use-employee-options";
import { Utensils } from "lucide-react";

interface MealVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: MealVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function MealVoucherDialog({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
  defaultMonth,
  defaultYear,
}: MealVoucherDialogProps) {
  const employees = useEmployeeOptions(isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <EntityDialogHeader
          icon={Utensils}
          title={voucherToEdit ? "Editar Vale Alimentação" : "Novo Vale Alimentação"}
          description="Informe a diária e a quantidade de dias para emissão do recibo."
          color="emerald"
        />

        <MealVoucherForm
          key={voucherToEdit?.id ?? "novo"}
          employees={employees}
          voucherToEdit={voucherToEdit}
          defaultMonth={defaultMonth}
          defaultYear={defaultYear}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
