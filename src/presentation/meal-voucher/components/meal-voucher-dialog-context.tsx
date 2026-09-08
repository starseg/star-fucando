import { createScopedContext } from "@/presentation/shared/hooks/create-scoped-context";

export interface MealVoucherDialogContextValue {
  employees: { id: string; name: string }[];
}

export const {
  Provider: MealVoucherDialogProvider,
  useScopedContext: useMealVoucherDialogContext,
} = createScopedContext<MealVoucherDialogContextValue>("MealVoucherDialog");
