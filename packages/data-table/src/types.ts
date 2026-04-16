import type {
  ColumnDef,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState
} from "@tanstack/react-table"

export type {
  Cell, CellContext, ColumnDef, ColumnFiltersState, ColumnPinningState, Header, HeaderContext, HeaderGroup, PaginationState, Row, RowSelectionState,
  SortingState, Table, VisibilityState
} from "@tanstack/react-table"

export interface DataTableBodyProps {
  className?: string
  children: React.ReactNode
}

export interface DataTableColumnMeta {
  label?: string
  align?: "left" | "center" | "right"
  neverHide?: boolean,
}

export interface IDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  className?: string;

  getRowError?: (rowId: string) => string | undefined;
  getRowClassName?: (row: Row<TData>) => string;

  // Selection
  enableSelection?: boolean;
  enableMultiRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (state: RowSelectionState) => void;

  // Pagination - shared
  enablePagination?: boolean;
  defaultPageSize?: number;

  // Pagination - server-side
  manualPagination?: boolean;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (state: PaginationState) => void;

  // Virtualization
  enableVirtualization?: boolean;

  // Column Visibility
  columnVisibility?: VisibilityState;

  // Sorting
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
}


declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData, TValue> extends DataTableColumnMeta {
  }
  interface ColumnDefBase<TData, TValue> {
    fixed?: "left" | "right",
    accessorKey?: string | readonly string[];
  }
}