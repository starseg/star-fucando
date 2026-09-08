"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { EmployeeData } from "./employee-table";
import { EmployeeForm } from "./employee-form";
import { UserPlus, UserCheck } from "lucide-react";

interface EmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: EmployeeData | null;
}

export function EmployeeDialog({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit,
}: EmployeeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <EntityDialogHeader
          icon={employeeToEdit ? UserCheck : UserPlus}
          title={employeeToEdit ? "Editar Colaborador" : "Novo Colaborador"}
          description={
            employeeToEdit
              ? "Atualize as informações cadastrais do funcionário."
              : "Cadastre um novo colaborador para lançar benefícios."
          }
        />

        <EmployeeForm
          key={employeeToEdit?.id ?? "novo"}
          employeeToEdit={employeeToEdit}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
