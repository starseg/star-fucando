import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/presentation/shared/searchable-select";
import type { UseFormRegister } from "react-hook-form";
import type { CommissionFormData } from "./commission-form";

interface CommissionEmployeeMonthFieldsProps {
  employees: { id: string; name: string }[];
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  employeeIdError?: string;
  register: UseFormRegister<CommissionFormData>;
}

export function CommissionEmployeeMonthFields({
  employees,
  employeeId,
  onEmployeeIdChange,
  employeeIdError,
  register,
}: CommissionEmployeeMonthFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Técnico *</Label>
        <SearchableSelect
          options={employees}
          value={employeeId}
          onValueChange={onEmployeeIdChange}
          placeholder="Selecione o técnico"
          searchPlaceholder="Buscar técnico..."
          emptyLabel="Nenhum técnico encontrado."
        />
        {employeeIdError && <p className="text-xs text-red-400">{employeeIdError}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
        <Input
          type="date"
          {...register("referenceMonth")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
      </div>
    </>
  );
}
