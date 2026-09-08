import { createScopedContext } from "@/presentation/shared/hooks/create-scoped-context";
import type { useTransportVoucherFormState } from "../hooks/use-transport-voucher-form-state";
import type { useTransportVoucherModalDrafts } from "../hooks/use-transport-voucher-modal-drafts";

export interface TransportVoucherDialogContextValue {
  employees: { id: string; name: string }[];
  formState: ReturnType<typeof useTransportVoucherFormState>;
  modalDrafts: ReturnType<typeof useTransportVoucherModalDrafts>;
  onSelectEmployee: (id: string) => void;
}

export const {
  Provider: TransportVoucherDialogProvider,
  useScopedContext: useTransportVoucherDialogContext,
} = createScopedContext<TransportVoucherDialogContextValue>("TransportVoucherDialog");
