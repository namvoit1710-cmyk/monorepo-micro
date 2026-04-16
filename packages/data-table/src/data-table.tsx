import { cn } from "@ldc/ui";

import TableViewPort from "./components/table-viewport";
import TableProvider from "./context/table-provider";
import type { IDataTableProps } from "./types";

const DataTable = <TData extends { _id: string },>({
    className,
    enablePagination,
    enableVirtualization,
    ...props
}: IDataTableProps<TData>) => {
    return (
        <TableProvider
            {...props}
            enablePagination={enablePagination}
            enableVirtualization={enableVirtualization}
            className={cn(className)}
        >
            <TableViewPort
                className={className}
                enablePagination={enablePagination}
            />
        </TableProvider>
    )
}

export default DataTable