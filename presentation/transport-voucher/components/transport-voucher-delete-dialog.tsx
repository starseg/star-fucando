"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransportVoucherDeleteDialogProps {
  voucher: { employee: { name: string } } | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TransportVoucherDeleteDialog({
  voucher,
  isDeleting,
  onCancel,
  onConfirm,
}: TransportVoucherDeleteDialogProps) {
  return (
    <AlertDialog open={!!voucher} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <AlertDialogContent className="sm:max-w-sm bg-[#141210] border-stone-800 text-stone-100 p-6 rounded-2xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-stone-100">Excluir lançamento</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-stone-400">
            Excluir o lançamento de Vale Transporte de &quot;{voucher?.employee.name}
            &quot;? Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3 border-t border-stone-800">
          <AlertDialogCancel
            disabled={isDeleting}
            className="bg-transparent border-none shadow-none text-stone-400 hover:text-stone-100 hover:bg-transparent text-xs"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="font-bold px-5 rounded-xl shadow-md bg-red-500 text-stone-950 hover:bg-red-400 shadow-red-500/20"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
