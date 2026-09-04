"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { createEmployee, updateEmployee } from "@/application/employee/employee-actions";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  pix: z.string().min(1, "A chave PIX é obrigatória"),
  department: z.string().optional(),
  role: z.string().optional(),
  admissionDate: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

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
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold text-stone-300">
          Nome Completo *
        </Label>
        <Input
          id="name"
          placeholder="Ex: Lucas Silva de Oliveira"
          {...register("name")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pix" className="text-xs font-semibold text-stone-300">
          Chave PIX *
        </Label>
        <Input
          id="pix"
          placeholder="Ex: CPF, CNPJ, e-mail, celular ou chave aleatória"
          {...register("pix")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
        {errors.pix && <p className="text-xs text-red-400">{errors.pix.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="department" className="text-xs font-semibold text-stone-300">
            Departamento
          </Label>
          <Input
            id="department"
            placeholder="Ex: Operações"
            {...register("department")}
            className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-xs font-semibold text-stone-300">
            Cargo / Função
          </Label>
          <Input
            id="role"
            placeholder="Ex: Vigilante / Fiscal"
            {...register("role")}
            className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admissionDate" className="text-xs font-semibold text-stone-300">
          Data de Admissão
        </Label>
        <Input
          id="admissionDate"
          type="date"
          {...register("admissionDate")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
      </div>

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={employeeToEdit ? "Salvar Alterações" : "Cadastrar Colaborador"}
      />
    </form>
  );
}
