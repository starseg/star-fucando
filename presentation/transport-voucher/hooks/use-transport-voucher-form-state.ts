import * as React from "react";

interface TransportVoucherToEditForFormState {
  employeeId: string;
  referenceMonth: Date | string;
  workingDays: number;
  discountPercentage: number | null;
  observations: string | null;
}

interface UseTransportVoucherFormStateOptions {
  isOpen: boolean;
  voucherToEdit?: TransportVoucherToEditForFormState | null;
  defaultRefDate: string;
}

export function useTransportVoucherFormState({
  isOpen,
  voucherToEdit,
  defaultRefDate,
}: UseTransportVoucherFormStateOptions) {
  const [employeeId, setEmployeeId] = React.useState("");
  const [referenceMonth, setReferenceMonth] = React.useState("");
  const [workingDays, setWorkingDays] = React.useState<number | string>(22);
  const [discountPercentage, setDiscountPercentage] = React.useState<number | string>(6.0);
  const [observations, setObservations] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (voucherToEdit) {
      const refDateStr = new Date(voucherToEdit.referenceMonth).toISOString().split("T")[0];
      setEmployeeId(voucherToEdit.employeeId);
      setReferenceMonth(refDateStr);
      setWorkingDays(Number(voucherToEdit.workingDays) || 22);
      setDiscountPercentage(
        voucherToEdit.discountPercentage !== null && voucherToEdit.discountPercentage !== undefined
          ? Number(voucherToEdit.discountPercentage)
          : 6.0
      );
      setObservations(voucherToEdit.observations || "");
    } else {
      setEmployeeId("");
      setReferenceMonth(defaultRefDate);
      setWorkingDays(22);
      setDiscountPercentage(6.0);
      setObservations("");
    }
    setFormError(null);
  }, [voucherToEdit, defaultRefDate, isOpen]);

  return {
    employeeId,
    setEmployeeId,
    referenceMonth,
    setReferenceMonth,
    workingDays,
    setWorkingDays,
    discountPercentage,
    setDiscountPercentage,
    observations,
    setObservations,
    formError,
    setFormError,
  };
}
