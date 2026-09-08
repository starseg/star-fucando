import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/presentation/shared/searchable-select";
import type { UseFormRegister } from "react-hook-form";
import type { AttendanceAwardFormData } from "./attendance-award-form";
import { useAttendanceAwardDialogContext } from "./attendance-award-dialog-context";

interface AttendanceAwardEmployeeMonthFieldsProps {
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  employeeIdError?: string;
  register: UseFormRegister<AttendanceAwardFormData>;
}

export function AttendanceAwardEmployeeMonthFields({
  employeeId,
  onEmployeeIdChange,
  employeeIdError,
  register,
}: AttendanceAwardEmployeeMonthFieldsProps) {
  const { employees } = useAttendanceAwardDialogContext();

  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
        <SearchableSelect
          options={employees}
          value={employeeId}
          onValueChange={onEmployeeIdChange}
          placeholder="Selecione o colaborador"
          searchPlaceholder="Buscar colaborador..."
          emptyLabel="Nenhum colaborador encontrado."
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
