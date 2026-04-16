import { cn } from "@ldc/ui"
import { TableHead, TableHeader, TableRow } from "@ldc/ui/components/table"
import { flexRender } from "@tanstack/react-table"
import { useTableContext } from "../../context/table-provider"
import { getPinningStyles } from "../../utils/helpers"

const StandardHeader = () => {
    const { table } = useTableContext()
    return (
        <TableHeader className="bg-background sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                        <TableHead
                            key={header.id}
                            className={cn(
                                "h-10 truncate whitespace-nowrap bg-muted/50 px-2 text-xs font-medium",
                                getPinningStyles(header.column).className,
                                header.column.columnDef.meta?.align === "center" && "text-center",
                                header.column.columnDef.meta?.align === "right" && "text-right",
                            )}
                            style={{
                                width: header.column.getSize(),
                                ...getPinningStyles(header.column).style
                            }}

                        >
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                        </TableHead>
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    )
}

export default StandardHeader