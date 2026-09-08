import { getEmployeeOptions } from "@/application/employee/use-cases/get-employee-options";
import { createOptionsHook } from "./create-options-hook";

export const useEmployeeOptions = createOptionsHook(getEmployeeOptions);
