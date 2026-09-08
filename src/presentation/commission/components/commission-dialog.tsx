"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { CommissionData } from "./commission-table";
import { CommissionForm } from "./commission-form";
import { CommissionDialogProvider } from "./commission-dialog-context";
import { useTechnicianOptions } from "@/presentation/shared/hooks/use-technician-options";
import { HandCoins } from "lucide-react";

interface CommissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commissionToEdit?: CommissionData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function CommissionDialog({
  isOpen,
  onClose,
  onSuccess,
  commissionToEdit,
  defaultMonth,
  defaultYear,
}: CommissionDialogProps) {
  const employees = useTechnicianOptions(isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <EntityDialogHeader
          icon={HandCoins}
          title={commissionToEdit ? "Editar Comissão" : "Nova Comissão"}
          description="Lançamento de comissão para técnicos."
          color="violet"
        />

        <CommissionDialogProvider value={{ employees }}>
          <CommissionForm
            key={commissionToEdit?.id ?? "novo"}
            commissionToEdit={commissionToEdit}
            defaultMonth={defaultMonth}
            defaultYear={defaultYear}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </CommissionDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
