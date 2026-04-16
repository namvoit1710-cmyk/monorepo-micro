import type { ColumnDef, PaginationState, RowSelectionState, SortingState, Updater } from "@tanstack/react-table";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { buildSelectionColumn } from "../components/renderers/selection-column";
import type { IDataTableProps } from "../types";
import { getInitialPinningFromColumns } from "../utils/helpers";

const useTableEngine = <TData extends { _id: string }>(props: IDataTableProps<TData>) => {
    const {
        data,
        columns,

        getRowError,

        enableSelection,
        enableMultiRowSelection,
        rowSelection,
        onRowSelectionChange,

        enablePagination,
        manualPagination,
        rowCount,
        pagination,
        onPaginationChange,

        columnVisibility,

        sorting,
        onSortingChange,
    } = props

    const resolvedColumns: ColumnDef<TData, unknown>[] = useMemo(
        () => enableSelection
            ? [buildSelectionColumn<TData>(getRowError ?? (() => undefined)), ...columns]
            : columns,
        [enableSelection, columns, getRowError]
    );

    const columnPinning = useMemo(() => getInitialPinningFromColumns(resolvedColumns), [resolvedColumns])

    const handleRowSelectionChange = useCallback((state: Updater<RowSelectionState>) => {
        if (!onRowSelectionChange) return;

        const next =
            typeof state === "function"
                ? state(rowSelection ?? {})
                : state;

        onRowSelectionChange(next);
    }, [onRowSelectionChange, rowSelection])

    const handlePaginationChange = useCallback(
        (updater: Updater<PaginationState>) => {
            const next = typeof updater === "function" ? updater(pagination ?? { pageIndex: 0, pageSize: 10 }) : updater;
            onPaginationChange?.(next);
        },
        [pagination, onPaginationChange]
    );

    const handleSortingChange = useCallback(
        (updater: Updater<SortingState>) => {
            const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
            onSortingChange?.(next);
        },
        [sorting, onSortingChange]
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable<TData>({
        data,
        columns: resolvedColumns,
        autoResetPageIndex: false,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row: TData) => {
            const rowData = row as Record<string, unknown>;
            return (rowData._id ?? rowData.id ?? rowData.ID) as string;
        },

        enableRowSelection: enableSelection,
        enableMultiRowSelection: enableMultiRowSelection,
        state: {
            sorting,
            columnPinning,
            columnVisibility,
            ...(rowSelection !== undefined && { rowSelection }),
            ...(enablePagination && { pagination }),
        },

        onSortingChange: handleSortingChange,
        getSortedRowModel: getSortedRowModel(),

        ...(enablePagination && {
            manualPagination,
            rowCount: manualPagination ? rowCount : undefined,
            getPaginationRowModel: getPaginationRowModel(),
            onPaginationChange: handlePaginationChange,
        }),

        onRowSelectionChange: handleRowSelectionChange,
    })

    return table
}

export default useTableEngine;