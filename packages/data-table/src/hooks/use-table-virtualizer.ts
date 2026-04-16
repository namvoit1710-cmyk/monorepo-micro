/* eslint-disable react-hooks/incompatible-library */
import type { Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

const useTableVirtualizer = <TData,>({ table, containerRef, enabled = false }: { table: Table<TData>, containerRef: React.RefObject<HTMLDivElement | null>, enabled?: boolean }) => {
    const rows = table.getRowModel().rows;
    const visibleLeafColumns = table.getVisibleLeafColumns();
    const unpinnedColumns = visibleLeafColumns.filter(
        (col) => !col.getIsPinned()
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 40,
        measureElement:
            typeof window !== "undefined" &&
                !navigator.userAgent.includes("Firefox")
                ? (el) => el?.getBoundingClientRect().height
                : undefined,
        overscan: 5,
        enabled: !!enabled
    });

    const columnVirtualizer = useVirtualizer({
        count: unpinnedColumns.length,
        getScrollElement: () => containerRef.current,
        estimateSize: (i) => unpinnedColumns[i]?.getSize() ?? 150,
        horizontal: true,
        overscan: 5,
        enabled: !!enabled
    });

    return {
        rowVirtualizer,
        columnVirtualizer
    }
}

export default useTableVirtualizer