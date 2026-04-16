import { cn } from "@ldc/ui"
import { TableCell, TableRow } from "@ldc/ui/components/table"
import { flexRender } from "@tanstack/react-table"
import { useTableContext } from "../../context/table-provider"
import { getPinningStyles } from "../../utils/helpers"

const StandardContent = () => {
    const { table, getRowClassName } = useTableContext()
    const rows = table.getRowModel().rows

    return (
        <>
            {rows.map((row) => (
                <TableRow
                    key={row.id}
                    className={cn(`index_${row.id}`, getRowClassName?.(row))}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell
                            key={cell.id}
                            className={cn(
                                cell.column.columnDef.meta?.align === "center" && "text-center",
                                cell.column.columnDef.meta?.align === "right" && "text-right",
                                getPinningStyles(cell.column).className
                            )}
                            style={getPinningStyles(cell.column).style}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

export default StandardContent