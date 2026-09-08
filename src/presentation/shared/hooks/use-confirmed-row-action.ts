import * as React from "react";
import { toast } from "sonner";

interface UseConfirmedRowActionOptions {
  onSettled?: () => void;
}

interface RunConfirmedActionParams {
  id: string;
  confirmMessage: string;
  action: () => Promise<{ success: boolean; error?: string }>;
  successMessage: string;
  errorMessage: string;
  unexpectedErrorMessage?: string;
}

export function useConfirmedRowAction({ onSettled }: UseConfirmedRowActionOptions = {}) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const run = React.useCallback(
    async ({
      id,
      confirmMessage,
      action,
      successMessage,
      errorMessage,
      unexpectedErrorMessage = "Erro inesperado.",
    }: RunConfirmedActionParams) => {
      if (!window.confirm(confirmMessage)) return;

      setProcessingId(id);
      try {
        const res = await action();
        if (res.success) {
          toast.success(successMessage);
          onSettled?.();
        } else {
          toast.error(res.error || errorMessage);
        }
      } catch {
        toast.error(unexpectedErrorMessage);
      } finally {
        setProcessingId(null);
      }
    },
    [onSettled],
  );

  return { processingId, run };
}
