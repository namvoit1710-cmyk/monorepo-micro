import { useTableContext } from "../context/table-provider"
import StandardContent from "./standard/standard-content"
import TableEmpty from "./table-empty"
import VirtualizedContent from "./virtualized/virtualized-content"

const TableContent = () => {
    const { table, enableVirtualization } = useTableContext()
    const rows = table.getRowModel().rows

    if (!rows.length) return <TableEmpty />

    if (!enableVirtualization) {
        return <StandardContent />
    }

    return <VirtualizedContent />
}

export default TableContent