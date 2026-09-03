import * as React from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataTableAccentColor } from "@/presentation/shared/data-table/data-table.types";

const SUBMIT_BUTTON_COLOR: Record<DataTableAccentColor, string> = {
  amber: "bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-amber-500/20",
  emerald: "bg-emerald-500 text-stone-950 hover:bg-emerald-400 shadow-emerald-500/20",
  sky: "bg-sky-500 text-stone-950 hover:bg-sky-400 shadow-sky-500/20",
};

interface EntityDialogFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel?: string;
  color?: DataTableAccentColor;
}

export function EntityDialogFooter({
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel = "Salvando...",
  color = "amber",
}: EntityDialogFooterProps) {
  return (
    <DialogFooter className="pt-3 border-t border-stone-800">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isSubmitting}
        className="text-stone-400 hover:text-stone-100 text-xs"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn("font-bold px-5 rounded-xl shadow-md", SUBMIT_BUTTON_COLOR[color])}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            {submittingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </DialogFooter>
  );
}
