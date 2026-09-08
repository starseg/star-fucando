"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { upsertAttendanceAward } from "@/application/attendance-award/use-cases/upsert-attendance-award";
import { AttendanceAwardInput } from "@/application/attendance-award/attendance-award-dto";
import { AttendanceAwardData } from "./attendance-award-table";
import { AttendanceAwardEmployeeMonthFields } from "./attendance-award-employee-month-fields";
import { AttendanceAwardBonusFields } from "./attendance-award-bonus-fields";
import { toast } from "sonner";

const attendanceAwardSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Selecione o colaborador"),
  referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
  bonusValue: z.coerce.number().min(0, "Informe o valor da bonificação"),
});

export type AttendanceAwardFormData = z.infer<typeof attendanceAwardSchema>;

interface AttendanceAwardFormProps {
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

export function AttendanceAwardForm({
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
      <AttendanceAwardEmployeeMonthFields
        employeeId={watch("employeeId")}
        onEmployeeIdChange={(val) => setValue("employeeId", val)}
        employeeIdError={errors.employeeId?.message}
        register={register}
      />

      <AttendanceAwardBonusFields
        register={register}
        bonusError={errors.bonusValue?.message}
        watchedBonus={watchedBonus}
      />

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={awardToEdit ? "Salvar Alterações" : "Cadastrar Premiação"}
        color="sky"
      />
    </form>
  );
}
