"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployee, updateEmployee } from "@/application/employee/employee-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  department: z.string().optional(),
  role: z.string().optional(),
  admissionDate: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: {
    id: string;
    name: string;
    department?: string | null;
    role?: string | null;
    admissionDate?: Date | string | null;
  } | null;
}

export function EmployeeDialog({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit,
}: EmployeeDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema as any),
    defaultValues: {
      name: "",
      department: "",
      role: "",
      admissionDate: "",
    },
  });

  React.useEffect(() => {
    if (employeeToEdit) {
      const formattedDate = employeeToEdit.admissionDate
        ? new Date(employeeToEdit.admissionDate).toISOString().split("T")[0]
        : "";
      reset({
        name: employeeToEdit.name,
        department: employeeToEdit.department || "",
        role: employeeToEdit.role || "",
        admissionDate: formattedDate,
      });
    } else {
      reset({
        name: "",
        department: "",
        role: "",
        admissionDate: "",
      });
    }
  }, [employeeToEdit, reset, isOpen]);

  const onSubmit = async (data: EmployeeFormData) => {
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-stone-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-100">
            {employeeToEdit ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            {employeeToEdit
              ? "Altere os dados do colaborador selecionado."
              : "Preencha as informações para cadastrar um novo colaborador."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-stone-300">
              Nome Completo *
            </Label>
            <Input
              id="name"
              placeholder="Ex: Lucas Silva"
              {...register("name")}
              className="bg-stone-950/60 border-stone-800 focus:border-amber-500 focus:ring-amber-500 text-stone-100"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-stone-300">
                Departamento
              </Label>
              <Input
                id="department"
                placeholder="Ex: Recursos Humanos"
                {...register("department")}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-stone-300">
                Cargo / Função
              </Label>
              <Input
                id="role"
                placeholder="Ex: Analista de RH"
                {...register("role")}
                className="bg-stone-950/60 border-stone-800 text-stone-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admissionDate" className="text-stone-300">
              Data de Admissão
            </Label>
            <Input
              id="admissionDate"
              type="date"
              {...register("admissionDate")}
              className="bg-stone-950/60 border-stone-800 text-stone-100"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-stone-700 hover:bg-stone-800 text-stone-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : employeeToEdit ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
