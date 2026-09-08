import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { EmployeeFormData } from "./employee-form";

interface EmployeeFormFieldsProps {
  register: UseFormRegister<EmployeeFormData>;
  errors: FieldErrors<EmployeeFormData>;
}

export function EmployeeFormFields({ register, errors }: EmployeeFormFieldsProps) {
  return (
    <>
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
    </>
  );
}
