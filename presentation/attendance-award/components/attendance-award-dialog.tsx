"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { upsertAttendanceAward } from "@/application/attendance-award/use-cases/upsert-attendance-award";
import { AttendanceAwardInput } from "@/application/attendance-award/attendance-award-dto";
import { getEmployeeOptions } from "@/application/employee/use-cases/get-employee-options";
import { AttendanceAwardData } from "./attendance-award-table";
import { toast } from "sonner";
import { Award, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const attendanceAwardSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione o colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  bonusValue: z.coerce.number().min(0.01, "Informe o valor da bonificação"),
});

type AttendanceAwardFormData = z.infer<typeof attendanceAwardSchema>;

interface AttendanceAwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  awardToEdit?: AttendanceAwardData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function AttendanceAwardDialog({
  isOpen,
  onClose,
  onSuccess,
  awardToEdit,
  defaultMonth,
  defaultYear,
}: AttendanceAwardDialogProps) {
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    async function loadEmployees() {
      const res = await getEmployeeOptions();
      if (res.success && res.data) {
        setEmployees(res.data.map((e) => ({ id: e.id, name: e.name })));
      }
    }
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <EntityDialogHeader
          icon={Award}
          title={awardToEdit ? "Editar Prêmio de Assiduidade" : "Novo Prêmio de Assiduidade"}
          description="Lançamento de bonificação por assiduidade integral."
          color="sky"
        />

        <AttendanceAwardForm
          key={awardToEdit?.id ?? "novo"}
          employees={employees}
          awardToEdit={awardToEdit}
          defaultMonth={defaultMonth}
          defaultYear={defaultYear}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

interface AttendanceAwardFormProps {
  employees: { id: string; name: string }[];
  awardToEdit?: AttendanceAwardData | null;
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess: () => void;
  onClose: () => void;
}

function buildDefaultRefDate(defaultMonth?: number, defaultYear?: number) {
  const year = defaultYear || new Date().getFullYear();
  const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function AttendanceAwardForm({
  employees,
  awardToEdit,
  defaultMonth,
  defaultYear,
  onSuccess,
  onClose,
}: AttendanceAwardFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceAwardFormData>({
    resolver: zodResolver(attendanceAwardSchema),
    defaultValues: awardToEdit
      ? {
          id: awardToEdit.id,
          employeeId: awardToEdit.employeeId,
          referenceMonth: new Date(awardToEdit.referenceMonth).toISOString().split("T")[0],
          bonusValue: awardToEdit.bonusValue,
        }
      : {
          employeeId: "",
          referenceMonth: buildDefaultRefDate(defaultMonth, defaultYear),
          bonusValue: 300.0,
        },
  });

  const watchedBonus = watch("bonusValue") || 0;

  const persistAttendanceAward = async (data: AttendanceAwardFormData) => {
    setIsLoading(true);
    try {
      const payload: AttendanceAwardInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        bonusValue: Number(data.bonusValue),
      };

      const res = await upsertAttendanceAward(payload);
      if (res.success) {
        toast.success(data.id ? "Prêmio de Assiduidade atualizado!" : "Prêmio de Assiduidade cadastrado com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Falha ao salvar Prêmio de Assiduidade.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(persistAttendanceAward)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Colaborador *</Label>
        <Select
          value={watch("employeeId")}
          onValueChange={(val) => setValue("employeeId", val)}
        >
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
        {errors.employeeId && (
          <p className="text-xs text-red-400">{errors.employeeId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Mês de Referência *</Label>
        <Input
          type="date"
          {...register("referenceMonth")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-stone-300">Valor da Bonificação (R$) *</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="Ex: 300,00"
          {...register("bonusValue")}
          className="bg-stone-900 border-stone-700/70 text-stone-100 h-10 rounded-xl font-semibold"
        />
        {errors.bonusValue && (
          <p className="text-xs text-red-400">{errors.bonusValue.message}</p>
        )}
      </div>

      <div className="rounded-xl bg-sky-500/10 border border-sky-500/25 p-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Valor da Premiação
        </span>
        <span className="text-2xl font-black text-sky-400">
          {formatCurrency(watchedBonus)}
        </span>
      </div>

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={awardToEdit ? "Salvar Alterações" : "Cadastrar Premiação"}
        color="sky"
      />
    </form>
  );
}
