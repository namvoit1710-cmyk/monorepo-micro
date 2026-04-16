import { cn } from "@ldc/ui";
import { TableHead, TableHeader, TableRow } from "@ldc/ui/components/table";
import { flexRender } from "@tanstack/react-table";
import { useTableContext } from "../../context/table-provider";
import { useVirtualizationContext } from "../../context/virtualized-provider";
import { getPinningStyles } from "../../utils/helpers";

const VirtualizedHeader = () => {
    const { table } = useTableContext();
    const { columnVirtualizer } = useVirtualizationContext();

    const virtualColumns = columnVirtualizer.getVirtualItems();
    const totalColumnsWidth = columnVirtualizer.getTotalSize();

    return (
        <TableHeader className="bg-background z-10 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => {
                const pinnedLeftHeaders = headerGroup.headers.filter(
                    (h) => h.column.getIsPinned() === "left"
                );
                const pinnedRightHeaders = headerGroup.headers.filter(
                    (h) => h.column.getIsPinned() === "right"
                );
                const unpinnedHeaders = headerGroup.headers.filter(
                    (h) => !h.column.getIsPinned()
                );

                return (
                    <TableRow
                        key={headerGroup.id}
                        className="hover:bg-transparent"
                        style={{ display: "flex" }}
                    >
                        {pinnedLeftHeaders.map((header) => (
                            <TableHead
                                key={header.id}
                                className={cn(
                                    "h-10 shrink-0 truncate whitespace-nowrap bg-muted/50 px-2 text-xs font-medium",
                                    "flex items-center",
                                    header.column.columnDef.meta?.align === "center" && "justify-center",
                                    header.column.columnDef.meta?.align === "right" && "justify-end",
                                    getPinningStyles(header.column).className
                                )}
                                style={{
                                    ...getPinningStyles(header.column).style,
                                    width: header.column.getSize()
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

                        <TableHead
                            className="relative flex-2 shrink-0 overflow-hidden bg-muted p-0 h-10"
                            style={{ width: totalColumnsWidth }}
                        >
                            {virtualColumns.map((vc) => {
                                const header = unpinnedHeaders[vc.index];
                                if (!header) return null;
                                return (
                                    <div
                                        data-index={vc.index}
                                        key={header.id}
                                        className={cn(
                                            "absolute top-0 h-10 flex items-center truncate whitespace-nowrap px-2 text-xs font-medium",
                                            header.column.columnDef.meta?.align === "center" && "justify-center",
                                            header.column.columnDef.meta?.align === "right" && "justify-end",
                                        )}
                                        style={{
                                            width: vc.size,
                                            transform: `translateX(${vc.start}px)`
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </div>
                                );
                            })}
                        </TableHead>

                        {pinnedRightHeaders.map((header) => (
                            <TableHead
                                key={header.id}
                                className={cn(
                                    "h-10 shrink-0 truncate whitespace-nowrap bg-muted/50 px-2 text-xs font-medium",
                                    "flex items-center",
                                    header.column.columnDef.meta?.align === "center" && "justify-center",
                                    header.column.columnDef.meta?.align === "right" && "justify-end",
                                    getPinningStyles(header.column).className
                                )}
                                style={{
                                    ...getPinningStyles(header.column).style,
                                    width: header.column.getSize()
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
                );
            })}
        </TableHeader>
    );
}

export default VirtualizedHeader