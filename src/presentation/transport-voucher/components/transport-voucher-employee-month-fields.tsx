import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/presentation/shared/searchable-select";
import { useTransportVoucherDialogContext } from "./transport-voucher-dialog-context";

export function TransportVoucherEmployeeMonthFields() {
  const { employees, formState, onSelectEmployee } = useTransportVoucherDialogContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
        <SearchableSelect
          options={employees}
          value={formState.employeeId}
          onValueChange={onSelectEmployee}
          placeholder="Selecione o colaborador"
          searchPlaceholder="Buscar colaborador..."
          emptyLabel="Nenhum colaborador encontrado."
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
        <Input
          type="date"
          value={formState.referenceMonth}
          onChange={(e) => formState.setReferenceMonth(e.target.value)}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-9 rounded-xl text-xs"
        />
      </div>
    </div>
  );
}
