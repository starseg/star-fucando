import * as React from "react";
import { useConfirmedRowAction } from "./use-confirmed-row-action";

interface UseDeleteWithConfirmationOptions {
  onDeleted?: () => void;
}

export function useDeleteWithConfirmation(
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>,
  { onDeleted }: UseDeleteWithConfirmationOptions = {},
) {
  const { processingId, run } = useConfirmedRowAction({ onSettled: onDeleted });

  const deleteWithConfirmation = React.useCallback(
    (
      id: string,
      confirmMessage: string,
      successMessage = "Excluído com sucesso!",
      errorMessage = "Erro ao excluir.",
    ) =>
      run({
        id,
        confirmMessage,
        action: () => deleteAction(id),
        successMessage,
        errorMessage,
      }),
    [deleteAction, run],
  );

  return { deletingId: processingId, deleteWithConfirmation };
}
