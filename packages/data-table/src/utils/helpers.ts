import { cn } from "@ldc/ui";
import type { Column } from "@tanstack/react-table";
import { createColumnHelper as _createColumnHelper } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import type { ColumnDef, ColumnPinningState } from "../types";

export function createColumns<TData>(
    factory: (
        helper: ReturnType<typeof _createColumnHelper<TData>>
    ) => ColumnDef<TData, any>[]
): ColumnDef<TData, any>[] {
    const helper = _createColumnHelper<TData>()
    return factory(helper)
}

export function getPinningStyles<TData>(
    column: Column<TData>
): { style: CSSProperties, className: string } {
    const columnDef = column.columnDef as ColumnDef<TData, any>;
    const isPinned = column.getIsPinned();
    const isLastLeft =
        isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight =
        isPinned === "right" && column.getIsFirstColumn("right");

    return {
        style: {
            ...(isPinned ? { minWidth: `${columnDef.minSize}px` } : {}),
            left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
            right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
            boxShadow: isLastLeft
                ? "-4px 0 4px -4px hsl(var(--border)) inset"
                : isFirstRight
                    ? "4px 0 4px -4px hsl(var(--border)) inset"
                    : undefined,

        },
        className: cn(
            isPinned ? "sticky" : "relative",
            isPinned ? "z-[1]" : "z-0",
            isPinned === "left" && "left-0",
            isPinned === "right" && "right-0",
            isPinned && "bg-background"
        )
    };
}

export function getInitialPinningFromColumns<TData>(
    columns: ColumnDef<TData, any>[]
): ColumnPinningState {
    const left: string[] = [];
    const right: string[] = [];

    for (const col of columns) {
        const id = col.id ?? col.accessorKey as string;
        const fixed = col.fixed;

        if (!id || !fixed) continue;

        if (fixed === "left") left.push(id);
        if (fixed === "right") right.push(id);
    }

    return { left, right };
}

export function buildPageItems(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    if (current <= 3) return [0, 1, 2, 3, 4, "ellipsis", total - 1];
    if (current >= total - 4) return [0, "ellipsis", total - 5, total - 4, total - 3, total - 2, total - 1];

    return [0, "ellipsis", current - 1, current, current + 1, "ellipsis", total - 1];
}