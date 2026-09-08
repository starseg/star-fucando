import { getTechnicianOptions } from "@/use-cases/employee/use-cases/get-technician-options";
import { createOptionsHook } from "./create-options-hook";

export const useTechnicianOptions = createOptionsHook(getTechnicianOptions);
