import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/presentation/shared/searchable-select";
import type { UseFormRegister } from "react-hook-form";
import type { CommissionFormData } from "./commission-form";
import { useCommissionDialogContext } from "./commission-dialog-context";

interface CommissionEmployeeMonthFieldsProps {
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  employeeIdError?: string;
  startDateError?: string;
  endDateError?: string;
  onReferenceMonthChange?: (value: string) => void;
  register: UseFormRegister<CommissionFormData>;
}

export function CommissionEmployeeMonthFields({
  employeeId,
  onEmployeeIdChange,
  employeeIdError,
  startDateError,
  endDateError,
  onReferenceMonthChange,
  register,
}: CommissionEmployeeMonthFieldsProps) {
  const { employees } = useCommissionDialogContext();

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
          {...register("referenceMonth", {
            onChange: (e) => onReferenceMonthChange?.(e.target.value),
          })}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-300">Início do Período</Label>
          <Input
            type="date"
            {...register("startDate")}
            className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
          />
          {startDateError && <p className="text-xs text-red-400">{startDateError}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-stone-300">Fim do Período</Label>
          <Input
            type="date"
            {...register("endDate")}
            className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
          />
          {endDateError && <p className="text-xs text-red-400">{endDateError}</p>}
        </div>
      </div>
    </>
  );
}
