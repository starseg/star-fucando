"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EntityDialogHeader } from "@/presentation/shared/dialog/entity-dialog-header";
import { EntityDialogFooter } from "@/presentation/shared/dialog/entity-dialog-footer";
import { TransportVoucherData } from "./transport-voucher-table";
import { TransportVoucherEmployeeMonthFields } from "./transport-voucher-employee-month-fields";
import { TransportVoucherModalList } from "./transport-voucher-modal-list";
import { TransportVoucherTotalsSummary } from "./transport-voucher-totals-summary";
import { TransportVoucherDiscountFields } from "./transport-voucher-discount-fields";
import { useEmployeeOptions } from "@/presentation/shared/hooks/use-employee-options";
import { useTransportVoucherModalDrafts } from "../hooks/use-transport-voucher-modal-drafts";
import { useTransportVoucherFormState } from "../hooks/use-transport-voucher-form-state";
import { useTransportVoucherSubmit } from "../hooks/use-transport-voucher-submit";
import { Bus } from "lucide-react";

interface TransportVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucherToEdit?: TransportVoucherData | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function TransportVoucherDialog({
  isOpen,
  onClose,
  onSuccess,
  voucherToEdit,
  defaultMonth,
  defaultYear,
}: TransportVoucherDialogProps) {
  const defaultRefDate = React.useMemo(() => {
    const year = defaultYear || new Date().getFullYear();
    const month = String(defaultMonth || new Date().getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  }, [defaultMonth, defaultYear]);

  const employees = useEmployeeOptions(isOpen);
  const formState = useTransportVoucherFormState({ isOpen, voucherToEdit, defaultRefDate });
  const modalDrafts = useTransportVoucherModalDrafts({ isOpen, voucherToEdit });

  const { isLoading, persistTransportVoucher } = useTransportVoucherSubmit({
    voucherId: voucherToEdit?.id,
    employeeId: formState.employeeId,
    referenceMonth: formState.referenceMonth,
    workingDays: formState.workingDays,
    discountPercentage: formState.discountPercentage,
    observations: formState.observations,
    drafts: modalDrafts.drafts,
    setFormError: formState.setFormError,
    onSuccess,
    onClose,
  });

  const handleWorkingDaysChange = (daysVal: string) => {
    formState.setWorkingDays(daysVal);
    modalDrafts.syncWorkingDays(daysVal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-2xl bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl"
      >
        <EntityDialogHeader
          icon={Bus}
          title={voucherToEdit ? "Editar Vale Transporte" : "Novo Lançamento de Vale Transporte"}
          description="Configure os modais e quantidades de passagens para emissão do recibo."
        />

        <form onSubmit={persistTransportVoucher} className="space-y-4 pt-1">
          {formState.formError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {formState.formError}
            </div>
          )}

          <TransportVoucherEmployeeMonthFields
            employees={employees}
            employeeId={formState.employeeId}
            onEmployeeIdChange={(val) => {
              formState.setEmployeeId(val);
              if (formState.formError) formState.setFormError(null);
            }}
            referenceMonth={formState.referenceMonth}
            onReferenceMonthChange={formState.setReferenceMonth}
          />

          <TransportVoucherModalList
            drafts={modalDrafts.drafts}
            workingDays={formState.workingDays}
            onWorkingDaysChange={handleWorkingDaysChange}
            onUpdateText={modalDrafts.updateModalText}
            onUpdateQuantity={modalDrafts.updateModalQuantity}
            onRemove={modalDrafts.removeModal}
            onAddExtra={() => modalDrafts.addExtraModal(formState.workingDays)}
          />

          <TransportVoucherTotalsSummary
            totalVouchers={modalDrafts.totalVouchers}
            totalValue={modalDrafts.totalValue}
          />

          <TransportVoucherDiscountFields
            discountPercentage={formState.discountPercentage}
            onDiscountPercentageChange={formState.setDiscountPercentage}
            observations={formState.observations}
            onObservationsChange={formState.setObservations}
          />

          <EntityDialogFooter
            onCancel={onClose}
            isSubmitting={isLoading}
            submitLabel={voucherToEdit ? "Salvar Alterações" : "Cadastrar Lançamento"}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
