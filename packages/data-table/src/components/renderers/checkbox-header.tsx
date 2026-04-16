import { Checkbox } from "@ldc/ui/components/checkbox"
import type { Table } from "@tanstack/react-table"

const CheckboxHeader = <TData,>({ table }: { table: Table<TData> }) => {
    if (!table.options.enableMultiRowSelection) {
        return null
    }

    return (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="select-all"
        />
    )
}

export default CheckboxHeader
