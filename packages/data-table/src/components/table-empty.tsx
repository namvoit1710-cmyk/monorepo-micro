import { TableCell, TableRow } from "@ldc/ui/components/table"
import { useTableContext } from "../context/table-provider"

const TableEmpty = () => {
    const { table, emptyState } = useTableContext()

    return (
        <TableRow>
            <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center text-sm text-muted-foreground"
            >
                {emptyState || "No results."}
            </TableCell>
        </TableRow>
    )
}

export default TableEmpty