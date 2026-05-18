import CopyUtils from "@/components/utils/copy-utils";
import { WORKFLOW_EXECUTION_STATUS_ENUM, WORKFLOW_EXECUTION_STATUS_TEXT } from "@/constants/workflows";
import { useLanguage } from "@/hooks/use-language";
import type { ColumnDef, PaginationState } from "@ldc/data-table";
import { DataTable, SortableHeader } from "@ldc/data-table";
import { keepPreviousData } from "@ldc/tanstack-query";
import { cn } from "@ldc/ui";
import { Badge } from "@ldc/ui/components/badge";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { useCallback, useMemo } from "react";
import { useWorkflowExecutionList } from "../../hooks/apis/workflows";
import useSearchParamsQuery from "../../hooks/use-search-params-query";
import type { IWorkflowExecutionHistory } from "../../types/execution";
import ExecutionFilter from "./execution-filter";

export interface IWorkflowExecutionHistoryProps {
    isActive?: boolean;
}

interface IIWorkflowExecutionHistoryColumnDef extends IWorkflowExecutionHistory, Record<"_id", string> { }

const STATUS_BADGE_CLASS: Record<string, string> = {
    [WORKFLOW_EXECUTION_STATUS_ENUM.COMPLETED]: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    [WORKFLOW_EXECUTION_STATUS_ENUM.FAILED]: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    [WORKFLOW_EXECUTION_STATUS_ENUM.CREATED]: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    [WORKFLOW_EXECUTION_STATUS_ENUM.RUNNING]: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    [WORKFLOW_EXECUTION_STATUS_ENUM.CANCELLED]: "bg-muted text-muted-foreground border-border",
    [WORKFLOW_EXECUTION_STATUS_ENUM.PENDING]: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    [WORKFLOW_EXECUTION_STATUS_ENUM.PAUSED]: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
};

const PAGE_SIZE = 20

const WorkflowExecutionHistory = ({ isActive }: IWorkflowExecutionHistoryProps) => {
    const { t } = useLanguage();
    const {
        currentPage,

        setCurrentPage,
        workflowId,
        setWorkflowId,
        executionStatus,
        sorting,
        setSorting,
        setExecutionStatus,
    } = useSearchParamsQuery({ defaultSorting: [{ id: "started_at", desc: true }] });

    const params = useMemo(() => {
        const queryParams: Record<string, any> = {
            $skip: (currentPage - 1) * PAGE_SIZE,
            $top: PAGE_SIZE,
        };
        const filterParts: string[] = [];
        if (workflowId && workflowId !== "all") {
            filterParts.push(`workflow_id eq '${workflowId}'`);
        }
        if (executionStatus) {
            filterParts.push(`status eq '${executionStatus}'`);
        }
        if (filterParts.length > 0) {
            queryParams.$filter = filterParts.join(" and ");
        }
        if (sorting?.length > 0) {
            queryParams.$orderby = sorting.map((s) => `${s.id} ${s.desc ? "desc" : "asc"}`).join(", ");
        }
        return queryParams;
    }, [currentPage, workflowId, executionStatus, sorting]);

    const { data: executionResponse, isLoading, isFetching } = useWorkflowExecutionList(params, {
        enabled: !!isActive,
        placeholderData: keepPreviousData,
    });

    const tableData = useMemo(() => {
        return (executionResponse?.data?.items ?? []).map(i => ({ ...i, _id: i.id })
        )
    }, [executionResponse, isActive]);

    const pagination: PaginationState = useMemo(() => ({
        pageIndex: currentPage - 1,
        pageSize: PAGE_SIZE,
    }), [currentPage]);

    const handlePaginationChange = useCallback((state: PaginationState) => {
        setCurrentPage(state.pageIndex + 1);
    }, [setCurrentPage]);

    const columns = useMemo((): ColumnDef<IIWorkflowExecutionHistoryColumnDef>[] => [
        {
            accessorKey: "id",
            header: () => t("execution_id"),
            cell: ({ row }) => (
                <div className="flex items-center">
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block">
                        {row.original.id}
                    </span>
                    <CopyUtils content={row.original.id ?? ""} />
                </div>
            ),
        },
        {
            id: "workflow_name",
            header: () => t("workflow_name"),
            cell: ({ row }) => (
                <span className="truncate max-w-[200px] block">{row.original.workflow_name ?? "—"}</span>
            ),
        },
        {
            accessorKey: "status",
            header: () => t("status"),
            maxSize: 160,
            cell: ({ row }) => {
                const status = row.original.status?.toLowerCase() || "";
                return (
                    <Badge
                        variant="outline"
                        className={cn("capitalize text-xs border", STATUS_BADGE_CLASS[status])}
                    >
                        {t(WORKFLOW_EXECUTION_STATUS_TEXT[status] ?? status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "started_at",
            header: ({ column }) => <SortableHeader title={t("started_at")} column={column} />,
            maxSize: 220,
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {row.original.started_at
                        ? format(row.original.started_at, "yyyy, MMMM dd hh:mm a", { locale: enGB })
                        : "—"}
                </span>
            ),
        },
        {
            accessorKey: "completed_at",
            header: ({ column }) => <SortableHeader title={t("completed_at")} column={column} />,
            maxSize: 220,
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {row.original.completed_at
                        ? format(row.original.completed_at, "yyyy, MMMM dd hh:mm a", { locale: enGB })
                        : "—"}
                </span>
            ),
        },
    ], [t]);

    return (
        <section className="flex flex-col h-full overflow-hidden gap-4 p-4">
            <ExecutionFilter
                isActive={isActive}
                initialFilter={{
                    workflowId,
                    executionStatus,
                }}
                setWorkflowId={setWorkflowId}
                setExecutionStatus={setExecutionStatus}
            />

            <div className={cn("transition-opacity flex-2 overflow-hidden", isFetching ? "opacity-60 pointer-events-none" : "")}>
                {(isLoading || isFetching) && (
                    <div className="loader-bar w-full" />
                )}
                <DataTable
                    data={tableData}
                    columns={columns}
                    enablePagination
                    manualPagination
                    sorting={sorting ?? []}
                    onSortingChange={setSorting}
                    rowCount={executionResponse?.data?.total ?? 0}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                />
            </div>
        </section>
    );
};

export default WorkflowExecutionHistory;