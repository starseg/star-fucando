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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertAttendanceAward, AttendanceAwardInput } from "@/application/attendance-award/attendance-award-actions";
import { getEmployees } from "@/application/employee/employee-actions";
import { AttendanceAwardData } from "./attendance-award-table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const attendanceAwardSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione um colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  bonusValue: z.coerce.number().min(0, "Valor do bônus não pode ser negativo"),
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  const defaultRefDate = React.useMemo(() => {
    const year = defaultYear || new Date().getFullYear();
    const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, [defaultMonth, defaultYear]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AttendanceAwardFormData>({
    resolver: zodResolver(attendanceAwardSchema as any),
    defaultValues: {
      employeeId: "",
      referenceMonth: defaultRefDate,
      bonusValue: 300.0,
    },
  });

  const watchedBonus = watch("bonusValue");

  React.useEffect(() => {
    async function loadEmployees() {
      const res = await getEmployees();
      if (res.success && res.data) {
        setEmployees(res.data.map((e) => ({ id: e.id, name: e.name })));
      }
    }
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (awardToEdit) {
      const refDateStr = new Date(awardToEdit.referenceMonth).toISOString().split("T")[0];
      reset({
        id: awardToEdit.id,
        employeeId: awardToEdit.employeeId,
        referenceMonth: refDateStr,
        bonusValue: awardToEdit.bonusValue,
      });
    } else {
      reset({
        employeeId: "",
        referenceMonth: defaultRefDate,
        bonusValue: 300.0,
      });
    }
  }, [awardToEdit, reset, defaultRefDate, isOpen]);

  const onSubmit = async (data: AttendanceAwardFormData) => {
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
        toast.success(data.id ? "Prêmio de Assiduidade atualizado!" : "Prêmio de Assiduidade cadastrado!");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 text-stone-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-100">
            {awardToEdit ? "Editar Prêmio de Assiduidade" : "Novo Prêmio de Assiduidade"}
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Lançamento de bonificação por assiduidade para o colaborador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-stone-300">Colaborador *</Label>
            <Select
              value={watch("employeeId")}
              onValueChange={(val) => setValue("employeeId", val)}
            >
              <SelectTrigger className="bg-stone-950/60 border-stone-800 text-stone-100">
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
            <Label className="text-stone-300">Data de Referência (Mês/Ano) *</Label>
            <Input
              type="date"
              {...register("referenceMonth")}
              className="bg-stone-950/60 border-stone-800 text-stone-100"
            />
            {errors.referenceMonth && (
              <p className="text-xs text-red-400">{errors.referenceMonth.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-stone-300">Valor da Bonificação (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              {...register("bonusValue")}
              className="bg-stone-950/60 border-stone-800 text-stone-100"
            />
            {errors.bonusValue && (
              <p className="text-xs text-red-400">{errors.bonusValue.message}</p>
            )}
          </div>

          <div className="rounded-lg bg-sky-500/10 p-3 border border-sky-500/20 flex items-center justify-between">
            <span className="text-xs text-sky-300 font-medium">Valor Total da Premiação</span>
            <span className="text-base font-bold text-sky-400">{formatCurrency(watchedBonus)}</span>
          </div>

          <DialogFooter className="pt-3 border-t border-stone-800">
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
              className="bg-sky-500 text-stone-950 hover:bg-sky-400 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : awardToEdit ? (
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
