import { useTableContext } from "../context/table-provider"

const TableColGroup = <TData,>() => {
    const { table, enableVirtualization } = useTableContext()

    if (enableVirtualization) {
        return null
    }

    return (
        <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
                <col
                    key={column.id}
                    style={{ width: column.getSize() }}
                />
            ))}
        </colgroup>
    )
}

export default TableColGroup