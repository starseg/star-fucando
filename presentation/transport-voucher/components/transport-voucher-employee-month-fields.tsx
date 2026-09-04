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

interface TransportVoucherEmployeeMonthFieldsProps {
  employees: { id: string; name: string }[];
  employeeId: string;
  onEmployeeIdChange: (value: string) => void;
  referenceMonth: string;
  onReferenceMonthChange: (value: string) => void;
}

export function TransportVoucherEmployeeMonthFields({
  employees,
  employeeId,
  onEmployeeIdChange,
  referenceMonth,
  onReferenceMonthChange,
}: TransportVoucherEmployeeMonthFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
        <Select value={employeeId} onValueChange={onEmployeeIdChange}>
          <SelectTrigger className="bg-stone-900 border-stone-700/70 text-stone-100 h-9 rounded-xl text-xs">
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
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
        <Input
          type="date"
          value={referenceMonth}
          onChange={(e) => onReferenceMonthChange(e.target.value)}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-9 rounded-xl text-xs"
        />
      </div>
    </div>
  );
}
