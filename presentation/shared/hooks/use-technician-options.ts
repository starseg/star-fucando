import * as React from "react";
import { getTechnicianOptions } from "@/application/employee/use-cases/get-technician-options";

export function useTechnicianOptions(isOpen: boolean) {
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    async function loadEmployees() {
      const res = await getTechnicianOptions();
      if (res.success && res.data) {
        setEmployees(res.data.map((e) => ({ id: e.id, name: e.name })));
      }
    }
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  return employees;
}
