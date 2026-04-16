"use client"

import { cn } from "@ldc/ui"
import {
    TableBody as PrimitiveTableBody
} from "@ldc/ui/components/table"
import type { DataTableBodyProps } from "../types"

const TableBody = ({ className, children }: DataTableBodyProps) => {

    return (
        <PrimitiveTableBody
            className={cn(className)}
        >
            {children}
        </PrimitiveTableBody>
    )
}

export default TableBody