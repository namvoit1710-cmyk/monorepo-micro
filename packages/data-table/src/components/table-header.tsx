"use client"

import { useTableContext } from "../context/table-provider"
import StandardHeader from "./standard/standard-header"
import VirtualizedHeader from "./virtualized/virtualized-header"

const TableHeader = () => {
    const { enableVirtualization } = useTableContext()

    if (!enableVirtualization) {
        return <StandardHeader />
    }

    return <VirtualizedHeader />
}

export default TableHeader