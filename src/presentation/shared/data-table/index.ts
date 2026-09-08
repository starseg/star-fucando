import { TableBody } from "@/components/ui/table";
import { DataTableRoot } from "./data-table-root";
import { DataTableHeader } from "./data-table-header";
import { DataTableHeadCell } from "./data-table-head-cell";
import { DataTableRow } from "./data-table-row";
import { DataTableSelectAllCell } from "./data-table-select-all-cell";
import { DataTableSelectRowCell } from "./data-table-select-row-cell";
import { DataTableAvatarCell } from "./data-table-avatar-cell";
import { DataTableActions } from "./data-table-actions";
import { DataTableIconAction } from "./data-table-icon-action";
import { DataTableEmptyState } from "./data-table-empty-state";
import { DataTableLoadingState } from "./data-table-loading-state";
import { DataTableEntityRow } from "./data-table-entity-row";

export const DataTable = {
  Root: DataTableRoot,
  Header: DataTableHeader,
  HeadCell: DataTableHeadCell,
  Body: TableBody,
  Row: DataTableRow,
  EntityRow: DataTableEntityRow,
  SelectAllCell: DataTableSelectAllCell,
  SelectRowCell: DataTableSelectRowCell,
  AvatarCell: DataTableAvatarCell,
  Actions: DataTableActions,
  IconAction: DataTableIconAction,
  EmptyState: DataTableEmptyState,
  LoadingState: DataTableLoadingState,
};

export type { DataTableAccentColor } from "./data-table.types";
