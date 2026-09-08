import { createScopedContext } from "@/presentation/shared/hooks/create-scoped-context";

export interface AttendanceAwardDialogContextValue {
  employees: { id: string; name: string }[];
}

export const {
  Provider: AttendanceAwardDialogProvider,
  useScopedContext: useAttendanceAwardDialogContext,
} = createScopedContext<AttendanceAwardDialogContextValue>("AttendanceAwardDialog");
