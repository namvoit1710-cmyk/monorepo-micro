import { Checkbox } from "@ldc/ui/components/checkbox"
import { RadioGroup, RadioGroupItem } from "@ldc/ui/components/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ldc/ui/components/tooltip"
import type { Row, Table } from "@tanstack/react-table"
import { AlertCircle } from "lucide-react"

interface CheckboxCellProps<TData> {
    row: Row<TData>
    table: Table<TData>
    errorMessage?: string
}

const MessageInfo = ({ errorMessage }: { errorMessage?: string }) => {
    if (!errorMessage) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="absolute top-1/2 -translate-y-1/3 translate-x-1/3 z-1 right-1/2">
                        <AlertCircle className="text-destructive" size={16} />

                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {errorMessage}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

const CheckboxCell = <TData,>({ row, table, errorMessage }: CheckboxCellProps<TData>) => {

    if (!table.options.enableMultiRowSelection) {
        return (
            <>
                <MessageInfo errorMessage={errorMessage} />
                <RadioGroup value={row.getIsSelected() ? "selected" : "not-selected"}>
                    <RadioGroupItem value="selected" id={`${row.id}-radio`} onClick={() => row.toggleSelected(!row.getIsSelected())} />
                </RadioGroup>
            </>
        )
    }

    return (
        <>
            <MessageInfo errorMessage={errorMessage} />
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label={`checkbox-${row.index}`}
            />
        </>
    )
}

export default CheckboxCell