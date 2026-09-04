import * as React from "react";
import { getEmployeeOptions } from "@/application/employee/use-cases/get-employee-options";

export function useMealVoucherEmployees(isOpen: boolean) {
  const [employees, setEmployees] = React.useState<{ id: string; name: string }[]>([]);

  React.useEffect(() => {
    async function loadEmployees() {
      const res = await getEmployeeOptions();
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
