import type { ColumnDef } from "@tanstack/react-table";
import CheckboxCell from "./checkbox-cell";
import CheckboxHeader from "./checkbox-header";

export const SELECTION_COLUMN_ID = "_select";

export function buildSelectionColumn<TData extends { _id: string }>(getRowError: (rowId: string) => string | undefined): ColumnDef<TData, any> {
    return {
        id: SELECTION_COLUMN_ID,
        fixed: "left",
        size: 40,
        header: ({ table }) => <CheckboxHeader table={table} />,
        cell: ({ row, table }) => (
            <CheckboxCell
                row={row}
                table={table}
                errorMessage={getRowError(row.original._id)}
            />
        )
    };
}