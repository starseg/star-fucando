"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AttendanceAwardDialog } from "./attendance-award-dialog";

interface AttendanceAwardCreateButtonProps {
  defaultMonth: number;
  defaultYear: number;
}

export function AttendanceAwardCreateButton({ defaultMonth, defaultYear }: AttendanceAwardCreateButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-sky-500 text-stone-950 hover:bg-sky-400 font-bold shadow-md shadow-sky-500/20 rounded-xl h-10 px-4"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Nova Bonificação
      </Button>

      <AttendanceAwardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => router.refresh()}
        awardToEdit={null}
        defaultMonth={defaultMonth}
        defaultYear={defaultYear}
      />
    </>
  );
}
