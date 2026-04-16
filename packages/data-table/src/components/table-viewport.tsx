import { cn } from "@ldc/ui";
import { Table } from "@ldc/ui/components/table";
import { useTableContext } from "../context/table-provider";
import VirtualizationProvider from "../context/virtualized-provider";
import TableBody from "./table-body";
import TableColGroup from "./table-col-group";
import TableContent from "./table-content";
import TableHeader from "./table-header";
import TablePagination from "./table-pagination";

interface TableViewPortProps {
    className?: string;
    enablePagination?: boolean;
}

const TableViewPort = ({
    className,
    enablePagination,
}: TableViewPortProps) => {
    const { scrollContainerRef } = useTableContext();

    return (
        <>
            <div
                ref={scrollContainerRef}
                className={cn("w-full overflow-auto flex-1 min-h-0", className)}
            >
                <VirtualizationProvider>
                    <Table
                        containerClassName={cn(
                            "overflow-visible w-full! table-fixed!",
                        )}
                    >
                        <TableColGroup />
                        <TableHeader />
                        <TableBody>
                            <TableContent />
                        </TableBody>
                    </Table>
                </VirtualizationProvider>
            </div>

            {enablePagination && (
                <div className="flex items-center justify-center">
                    <TablePagination />
                </div>
            )}
        </>
    );
};

export default TableViewPort;