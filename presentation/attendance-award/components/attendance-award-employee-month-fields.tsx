import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseFormRegister } from "react-hook-form";
import type { AttendanceAwardFormData } from "./attendance-award-dialog";

interface AttendanceAwardEmployeeMonthFieldsProps {
  employees: { id: string; name: string }[];
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  employeeIdError?: string;
  register: UseFormRegister<AttendanceAwardFormData>;
}

export function AttendanceAwardEmployeeMonthFields({
  employees,
  employeeId,
  onEmployeeIdChange,
  employeeIdError,
  register,
}: AttendanceAwardEmployeeMonthFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
        <Select value={employeeId} onValueChange={onEmployeeIdChange}>
          <SelectTrigger className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl">
            <SelectValue placeholder="Selecione o colaborador" />
          </SelectTrigger>
          <SelectContent className="bg-stone-900 border-stone-800 text-stone-100">
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
