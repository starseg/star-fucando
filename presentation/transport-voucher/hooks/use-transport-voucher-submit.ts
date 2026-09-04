import * as React from "react";
import { toast } from "sonner";
import {
  parseDecimalInput,
  parseIntegerInput,
  roundMoney,
  sumBy,
} from "@/lib/number";
import { upsertTransportVoucher } from "@/application/transport-voucher/use-cases/upsert-transport-voucher";
import {
  TransportVoucherInput,
  TransportModalInput,
} from "@/application/transport-voucher/transport-voucher-dto";
import type { ModalDraft } from "./use-transport-voucher-modal-drafts";

interface UseTransportVoucherSubmitOptions {
  voucherId?: string;
  employeeId: string;
  referenceMonth: string;
  workingDays: number | string;
  discountPercentage: number | string;
  observations: string;
  drafts: ModalDraft[];
  setFormError: (message: string | null) => void;
  onSuccess: () => void;
  onClose: () => void;
}

export function useTransportVoucherSubmit({
  voucherId,
  employeeId,
  referenceMonth,
  workingDays,
  discountPercentage,
  observations,
  drafts,
  setFormError,
  onSuccess,
  onClose,
}: UseTransportVoucherSubmitOptions) {
  const [isLoading, setIsLoading] = React.useState(false);

  const persistTransportVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setFormError("Selecione o colaborador.");
      return;
    }
    if (!referenceMonth) {
      setFormError("Selecione o mês de referência.");
      return;
    }
    if (drafts.length === 0) {
      setFormError("Adicione pelo menos um transporte.");
      return;
    }

    for (const d of drafts) {
      const name = (d.name || "").trim();
      const quantity = parseIntegerInput(d.quantityText);
      const unitValue = parseDecimalInput(d.unitValueText);
      if (!name || quantity < 1 || unitValue <= 0) {
        setFormError(
          `A linha "${name || d.name || "sem nome"}" precisa de uma quantidade e tarifa válidas.`,
        );
        return;
      }
    }

    setIsLoading(true);
    setFormError(null);
    try {
      const sanitizedModals: TransportModalInput[] = drafts.map((d) => {
        const quantity = parseIntegerInput(d.quantityText);
        const unitValue = parseDecimalInput(d.unitValueText);
        return {
          id: d.dbId,
          name: d.name.trim(),
          unitValue,
          quantity,
          subtotal: roundMoney(quantity * unitValue),
        };
      });

      const finalTotalVouchers = sumBy(sanitizedModals, (m) => m.quantity);
      const finalTotalValue = roundMoney(
        sumBy(sanitizedModals, (m) => m.subtotal),
      );

      const inboundModal =
        sanitizedModals.find((m) => m.name.toLowerCase().includes("ida")) ??
        sanitizedModals[0];
      const outboundModal =
        sanitizedModals.find((m) => m.name.toLowerCase().includes("volta")) ??
        sanitizedModals[1];

      const parsedDiscount =
        discountPercentage !== undefined &&
        discountPercentage !== null &&
        String(discountPercentage).trim() !== ""
          ? Number(discountPercentage)
          : null;

      const payload: TransportVoucherInput = {
        id: voucherId,
        employeeId,
        referenceMonth,
        inboundValue: inboundModal ? inboundModal.unitValue : 0,
        outboundValue: outboundModal ? outboundModal.unitValue : 0,
        workingDays: parseIntegerInput(workingDays),
        weekendHolidayDays: 0,
        weekendHolidayValue: null,
        nightJokerIndicator: false,
        totalVouchers: finalTotalVouchers,
        totalValue: finalTotalValue,
        discountPercentage: parsedDiscount,
        observations: observations?.trim() || null,
        modals: sanitizedModals,
      };

      const res = await upsertTransportVoucher(payload);
      if (res.success) {
        toast.success(
          voucherId
            ? "Vale Transporte atualizado!"
            : "Vale Transporte cadastrado com sucesso!",
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Falha ao salvar Vale Transporte.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao salvar lançamento.");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, persistTransportVoucher };
}
