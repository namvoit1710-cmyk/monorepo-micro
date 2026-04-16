import { cn } from "@ldc/ui";
import { TableCell, TableRow } from "@ldc/ui/components/table";
import { flexRender } from "@tanstack/react-table";
import { useTableContext } from "../../context/table-provider";
import { useVirtualizationContext } from "../../context/virtualized-provider";
import { getPinningStyles } from "../../utils/helpers";

const VirtualizedContent = () => {
    const { table, getRowClassName } = useTableContext();
    const { rowVirtualizer, columnVirtualizer } = useVirtualizationContext();

    const rows = table.getRowModel().rows;
    const virtualRows = rowVirtualizer.getVirtualItems();
    const virtualColumns = columnVirtualizer.getVirtualItems();
    const totalRowsHeight = rowVirtualizer.getTotalSize();
    const totalColumnsWidth = columnVirtualizer.getTotalSize();

    return (
        <>
            {virtualRows.length > 0 && virtualRows[0] && (
                <TableRow
                    style={{ height: virtualRows[0]?.start ?? 0, display: "block", border: "none" }}
                />
            )}

            {virtualRows.map((vr) => {
                const row = rows[vr.index];
                if (!row) return null;

                const pinnedLeftCells = row
                    .getVisibleCells()
                    .filter((c) => c.column.getIsPinned() === "left");
                const pinnedRightCells = row
                    .getVisibleCells()
                    .filter((c) => c.column.getIsPinned() === "right");
                const unpinnedCells = row
                    .getVisibleCells()
                    .filter((c) => !c.column.getIsPinned());

                return (
                    <TableRow
                        key={row.original._id ?? vr.index}
                        data-rowid={vr.index}
                        data-index={vr.index}
                        ref={(node) => {
                            if (node) rowVirtualizer.measureElement(node);
                        }}
                        data-state={
                            row.getIsSelected() ? "selected" : undefined
                        }
                        className={cn(`index_${row.id}`, getRowClassName?.(row))}
                        style={{ display: "flex" }}
                    >
                        {pinnedLeftCells.map((cell) => (
                            <TableCell
                                key={cell.id}
                                className={cn(
                                    "min-h-12 shrink-0 flex items-center",
                                    cell.column.columnDef.meta?.align ===
                                    "center" && "justify-center",
                                    cell.column.columnDef.meta?.align ===
                                    "right" && "justify-end",
                                    getPinningStyles(cell.column).className
                                )}
                                style={{
                                    ...getPinningStyles(cell.column).style,
                                    width: cell.column.getSize()
                                }}
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}

                        <TableCell
                            className="min-h-12 flex-2 relative shrink-0 p-0"
                            style={{ width: totalColumnsWidth }}
                        >
                            {virtualColumns.map((vc) => {
                                const cell = unpinnedCells[vc.index];
                                if (!cell) return null;
                                return (
                                    <div
                                        key={cell.id}
                                        data-index={vc.index}
                                        className={cn(
                                            "absolute top-0 h-full flex items-center px-2 overflow-hidden",
                                            cell.column.columnDef.meta
                                                ?.align === "center" &&
                                            "justify-center",
                                            cell.column.columnDef.meta
                                                ?.align === "right" &&
                                            "justify-end"
                                        )}
                                        style={{
                                            width: vc.size,
                                            transform: `translateX(${vc.start}px)`
                                        }}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </div>
                                );
                            })}
                        </TableCell>

                        {pinnedRightCells.map((cell) => (
                            <TableCell
                                key={cell.id}
                                className={cn(
                                    "min-h-12 shrink-0",
                                    cell.column.columnDef.meta?.align ===
                                    "center" && "text-center",
                                    cell.column.columnDef.meta?.align ===
                                    "right" && "text-right",
                                    getPinningStyles(cell.column).className
                                )}
                                style={{
                                    ...getPinningStyles(cell.column).style,
                                    width: cell.column.getSize()
                                }}
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            })}

            {virtualRows.length > 0 && (
                <TableRow
                    style={{
                        height:
                            totalRowsHeight -
                            (virtualRows[virtualRows.length - 1]?.end ?? 0),
                        display: "block",
                        border: "none"
                    }}
                />
            )}
        </>
    );
}

export default VirtualizedContent;