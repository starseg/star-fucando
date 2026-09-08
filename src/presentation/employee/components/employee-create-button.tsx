"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { EmployeeDialog } from "./employee-dialog";

export function EmployeeCreateButton() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20 rounded-xl h-10 px-4"
      >
        <UserPlus className="mr-1.5 h-4 w-4" />
        Novo Colaborador
      </Button>

      <EmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => router.refresh()}
        employeeToEdit={null}
      />
    </>
  );
}
