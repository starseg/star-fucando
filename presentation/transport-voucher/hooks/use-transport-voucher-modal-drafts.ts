import * as React from "react";
import { parseDecimalInput, parseIntegerInput, roundMoney, sumBy } from "@/lib/number";

export interface ModalDraft {
  key: string;
  dbId?: string;
  name: string;
  unitValueText: string;
  quantityText: string;
  followWorkingDays: boolean;
}

function createModalDraft(
  name: string,
  unitValue: number | string,
  quantity: number | string,
  followWorkingDays: boolean,
  dbId?: string
): ModalDraft {
  return {
    key: crypto.randomUUID(),
    dbId,
    name,
    unitValueText: String(unitValue),
    quantityText: String(quantity),
    followWorkingDays,
  };
}

export function rowSubtotal(draft: ModalDraft): number {
  return roundMoney(parseIntegerInput(draft.quantityText) * parseDecimalInput(draft.unitValueText));
}

function createDefaultDrafts(unitValue: number | string, quantity: number | string): ModalDraft[] {
  return [
    createModalDraft("Ônibus Ida", unitValue, quantity, true),
    createModalDraft("Ônibus Volta", unitValue, quantity, true),
  ];
}

interface TransportVoucherToEditForDrafts {
  workingDays: number;
  inboundValue: number;
  outboundValue: number;
  modals: { id: string; name: string; unitValue: number; quantity: number }[];
}

interface UseTransportVoucherModalDraftsOptions {
  isOpen: boolean;
  voucherToEdit?: TransportVoucherToEditForDrafts | null;
}

export function useTransportVoucherModalDrafts({ isOpen, voucherToEdit }: UseTransportVoucherModalDraftsOptions) {
  const [drafts, setDrafts] = React.useState<ModalDraft[]>(() => createDefaultDrafts(4.8, 22));

  React.useEffect(() => {
    if (!isOpen) return;
    if (voucherToEdit) {
      const incoming = voucherToEdit.modals || [];
      if (incoming.length > 0) {
        setDrafts(
          incoming.map((m) =>
            createModalDraft(m.name, Number(m.unitValue) || 0, Number(m.quantity) || 0, false, m.id)
          )
        );
      } else {
        // Dado legado: voucher sem modais no banco, fabrica as duas linhas padrão
        const wDays = Number(voucherToEdit.workingDays) || 22;
        const inVal = Number(voucherToEdit.inboundValue) || 4.8;
        const outVal = Number(voucherToEdit.outboundValue) || 4.8;
        setDrafts([
          createModalDraft("Ônibus Ida", inVal, wDays, true),
          createModalDraft("Ônibus Volta", outVal, wDays, true),
        ]);
      }
    } else {
      setDrafts(createDefaultDrafts(4.8, 22));
    }
  }, [voucherToEdit, isOpen]);

  const updateModalText = (key: string, field: "name" | "unitValueText", value: string) => {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  };

  const updateModalQuantity = (key: string, value: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, quantityText: value, followWorkingDays: false } : d))
    );
  };

  const addExtraModal = (workingDays: number | string) => {
    const numericDays = parseIntegerInput(workingDays);
    setDrafts((prev) => [...prev, createModalDraft("Transporte Adicional", 5.0, numericDays, true)]);
  };

  const removeModal = (key: string) => {
    setDrafts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.key !== key);
    });
  };

  const syncWorkingDays = (daysVal: string) => {
    setDrafts((prev) => prev.map((d) => (d.followWorkingDays ? { ...d, quantityText: daysVal } : d)));
  };

  const totalVouchers = React.useMemo(() => sumBy(drafts, (d) => parseIntegerInput(d.quantityText)), [drafts]);
  const totalValue = React.useMemo(() => sumBy(drafts, (d) => rowSubtotal(d)), [drafts]);

  return {
    drafts,
    totalVouchers,
    totalValue,
    updateModalText,
    updateModalQuantity,
    addExtraModal,
    removeModal,
    syncWorkingDays,
  };
}
