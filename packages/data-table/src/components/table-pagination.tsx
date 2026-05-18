"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@ldc/ui/components/pagination";
import { useTableContext } from "../context/table-provider";
import { buildPageItems } from "../utils/helpers";

const TablePagination = () => {
    const { table } = useTableContext();
    const { pageIndex } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const pageItems = buildPageItems(pageIndex, pageCount);

    if (pageCount <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-3">
            <Pagination className="w-auto mx-0">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            size="sm"
                            onClick={() => table.previousPage()}
                            aria-disabled={!table.getCanPreviousPage()}
                            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {pageItems.map((item, idx) =>
                        item === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={item}>
                                <PaginationLink
                                    size="sm"
                                    isActive={item === pageIndex}
                                    onClick={() => table.setPageIndex(item)}
                                    className="cursor-pointer"
                                >
                                    {item + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            size="sm"
                            onClick={() => table.nextPage()}
                            aria-disabled={!table.getCanNextPage()}
                            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default TablePagination;