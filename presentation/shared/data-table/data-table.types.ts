import type { LucideIcon } from "lucide-react";

export type DataTableAccentColor = "amber" | "emerald" | "sky" | "violet";

export interface DataTableIconActionProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  title?: string;
}
