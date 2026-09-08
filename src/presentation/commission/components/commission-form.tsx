"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { upsertCommission } from "@/use-cases/commission/use-cases/upsert-commission";
import { CommissionInput } from "@/use-cases/commission/commission-dto";
import { CommissionData } from "./commission-table";
import { CommissionEmployeeMonthFields } from "./commission-employee-month-fields";
import { CommissionValueFields } from "./commission-value-fields";
import { getCommissionDefaultPeriod } from "@/lib/utils";
import { toast } from "sonner";

const commissionSchema = z
  .object({
    id: z.string().optional(),
    employeeId: z.string().min(1, "Selecione o técnico"),
    referenceMonth: z.string().min(1, "Mês de referência obrigatório"),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    commissionValue: z.coerce.number().min(0, "Informe o valor da comissão"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Data inicial deve ser anterior ou igual à data final",
      path: ["startDate"],
    }
  );

export type CommissionFormData = z.infer<typeof commissionSchema>;

interface CommissionFormProps {
  commissionToEdit?: CommissionData | null;
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

export function CommissionForm({
  commissionToEdit,
  defaultMonth,
  defaultYear,
  onSuccess,
  onClose,
}: CommissionFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const defaultRefDate = buildDefaultRefDate(defaultMonth, defaultYear);
  const initialDefaultPeriod = commissionToEdit
    ? getCommissionDefaultPeriod(commissionToEdit.referenceMonth)
    : getCommissionDefaultPeriod(defaultRefDate);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommissionFormData>({
    resolver: zodResolver(commissionSchema),
    defaultValues: commissionToEdit
      ? {
          id: commissionToEdit.id,
          employeeId: commissionToEdit.employeeId,
          referenceMonth: new Date(commissionToEdit.referenceMonth).toISOString().split("T")[0],
          startDate: commissionToEdit.startDate
            ? new Date(commissionToEdit.startDate).toISOString().split("T")[0]
            : initialDefaultPeriod.startDate,
          endDate: commissionToEdit.endDate
            ? new Date(commissionToEdit.endDate).toISOString().split("T")[0]
            : initialDefaultPeriod.endDate,
          commissionValue: commissionToEdit.commissionValue,
        }
      : {
          employeeId: "",
          referenceMonth: defaultRefDate,
          startDate: initialDefaultPeriod.startDate,
          endDate: initialDefaultPeriod.endDate,
          commissionValue: 0,
        },
  });

  const watchedCommission = watch("commissionValue") || 0;

  const handleReferenceMonthChange = (newRefMonth: string) => {
    setValue("referenceMonth", newRefMonth);
    if (newRefMonth) {
      const { startDate, endDate } = getCommissionDefaultPeriod(newRefMonth);
      setValue("startDate", startDate);
      setValue("endDate", endDate);
    }
  };

  const persistCommission = async (data: CommissionFormData) => {
    setIsLoading(true);
    try {
      const payload: CommissionInput = {
        id: data.id,
        employeeId: data.employeeId,
        referenceMonth: data.referenceMonth,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        commissionValue: Number(data.commissionValue),
      };

      const res = await upsertCommission(payload);
      if (res.success) {
        toast.success(data.id ? "Comissão atualizada!" : "Comissão cadastrada com sucesso!");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Falha ao salvar Comissão.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(persistCommission)} className="space-y-4 pt-2">
      <CommissionEmployeeMonthFields
        employeeId={watch("employeeId")}
        onEmployeeIdChange={(val) => setValue("employeeId", val)}
        employeeIdError={errors.employeeId?.message}
        startDateError={errors.startDate?.message}
        endDateError={errors.endDate?.message}
        onReferenceMonthChange={handleReferenceMonthChange}
        register={register}
      />

      <CommissionValueFields
        register={register}
        commissionError={errors.commissionValue?.message}
        watchedCommission={watchedCommission}
      />

      <EntityDialogFooter
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel={commissionToEdit ? "Salvar Alterações" : "Cadastrar Comissão"}
        color="violet"
      />
    </form>
  );
}
