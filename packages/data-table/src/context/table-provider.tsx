import { cn } from "@ldc/ui";
import { createContext, useContext, useRef } from "react";
import useTableEngine from "../hooks/use-table-engine";
import type { IDataTableProps, Row, Table } from "../types";

const Context = createContext<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: Table<any>,
    emptyState?: React.ReactNode,
    enableVirtualization?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRowClassName?: (row: Row<any>) => string;
    getRowError?: (rowId: string) => string | undefined;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
} | null>(null)

interface IDataTableRootProps<TData extends { _id: string }> extends IDataTableProps<TData> {
    children: React.ReactNode,
    emptyState?: React.ReactNode
}

const TableProvider = <TData extends { _id: string },>({
    emptyState,
    className,
    children,
    getRowClassName,

    enableVirtualization,

    ...props
}: IDataTableRootProps<TData>) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const table = useTableEngine(props)

    return (
        <Context.Provider value={{
            table, emptyState, enableVirtualization, scrollContainerRef, getRowClassName
        }}
        >
            <div className={cn("flex flex-col overflow-hidden h-full w-full", className)}>
                {children}
            </div>
        </Context.Provider>
    )
}

export default TableProvider

export function useTableContext() {
    const ctx = useContext(Context)
    if (!ctx) {
        throw new Error(
            "useTableContext must be used inside <DataTableRoot>. " +
            "Make sure your component is a descendant of <DataTableRoot>."
        )
    }
    return ctx
}