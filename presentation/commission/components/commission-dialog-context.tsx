import { createScopedContext } from "@/presentation/shared/hooks/create-scoped-context";

export interface CommissionDialogContextValue {
  employees: { id: string; name: string }[];
}

export const {
  Provider: CommissionDialogProvider,
  useScopedContext: useCommissionDialogContext,
} = createScopedContext<CommissionDialogContextValue>("CommissionDialog");
