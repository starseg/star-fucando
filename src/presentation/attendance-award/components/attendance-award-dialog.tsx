"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { AttendanceAwardData } from "./attendance-award-table";
import { AttendanceAwardForm } from "./attendance-award-form";
import { AttendanceAwardDialogProvider } from "./attendance-award-dialog-context";
import { useEmployeeOptions } from "@/presentation/shared/hooks/use-employee-options";
import { Award } from "lucide-react";

interface AttendanceAwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  awardToEdit?: AttendanceAwardData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function AttendanceAwardDialog({
  isOpen,
  onClose,
  onSuccess,
  awardToEdit,
  defaultMonth,
  defaultYear,
}: AttendanceAwardDialogProps) {
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
          icon={Award}
          title={awardToEdit ? "Editar Prêmio de Assiduidade" : "Novo Prêmio de Assiduidade"}
          description="Lançamento de bonificação por assiduidade integral."
          color="sky"
        />

        <AttendanceAwardDialogProvider value={{ employees }}>
          <AttendanceAwardForm
            key={awardToEdit?.id ?? "novo"}
            awardToEdit={awardToEdit}
            defaultMonth={defaultMonth}
            defaultYear={defaultYear}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </AttendanceAwardDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
