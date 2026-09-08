"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { createEmployee } from "@/use-cases/employee/use-cases/create-employee";
import { updateEmployee } from "@/use-cases/employee/use-cases/update-employee";
import { EmployeeFormFields } from "./employee-form-fields";
import { EmployeeData } from "./employee-table";
import { toast } from "sonner";

const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  pix: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  admissionDate: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employeeToEdit?: EmployeeData | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function EmployeeForm({ employeeToEdit, onSuccess, onClose }: EmployeeFormProps) {
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
