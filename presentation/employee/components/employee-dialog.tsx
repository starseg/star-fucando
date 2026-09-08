"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { createEmployee } from "@/application/employee/use-cases/create-employee";
import { updateEmployee } from "@/application/employee/use-cases/update-employee";
import { EmployeeFormFields } from "./employee-form-fields";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  pix: z.string().min(1, "A chave PIX é obrigatória"),
  department: z.string().optional(),
  role: z.string().optional(),
  admissionDate: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeToEdit {
  id: string;
  name: string;
  pix?: string | null;
  department?: string | null;
  role?: string | null;
  admissionDate?: Date | string | null;
}

interface EmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: EmployeeToEdit | null;
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

interface EmployeeFormProps {
  employeeToEdit?: EmployeeToEdit | null;
  onSuccess: () => void;
  onClose: () => void;
}

function EmployeeForm({ employeeToEdit, onSuccess, onClose }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employeeToEdit
      ? {
          name: employeeToEdit.name,
          pix: employeeToEdit.pix || "",
          department: employeeToEdit.department || "",
          role: employeeToEdit.role || "",
          admissionDate: employeeToEdit.admissionDate
            ? new Date(employeeToEdit.admissionDate).toISOString().split("T")[0]
            : "",
        }
      : {
          name: "",
          pix: "",
          department: "",
          role: "",
          admissionDate: "",
        },
  });

  const persistEmployee = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      if (employeeToEdit) {
        const res = await updateEmployee(employeeToEdit.id, data);
        if (res.success) {
          toast.success("Colaborador atualizado com sucesso!");
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || "Erro ao atualizar colaborador.");
        }
      } else {
        const res = await createEmployee(data);
        if (res.success) {
          toast.success("Colaborador cadastrado com sucesso!");
          onSuccess();
          onClose();
        } else {
          toast.error(res.error || "Erro ao cadastrar colaborador.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(persistEmployee)} className="space-y-4 pt-2">
      <EmployeeFormFields register={register} errors={errors} />

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={employeeToEdit ? "Salvar Alterações" : "Cadastrar Colaborador"}
      />
    </form>
  );
}
