import { cn } from "@ldc/ui"
import { Button } from "@ldc/ui/components/button"
import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

interface SortableHeaderProps<TData, TValue> {
    column: Column<TData, TValue>
    title: string
    className?: string
}

export function SortableHeader<TData, TValue>({
    column,
    title,
    className,
}: SortableHeaderProps<TData, TValue>) {
    const sorted = column.getIsSorted()

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("-ml-3 h-8 gap-1 w-full font-medium flex items-center justify-between", className)}
            onClick={column.getToggleSortingHandler()}
        >
            <span>{title}</span>

            {sorted === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5" />
            ) : sorted === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
        </Button>
    )
}