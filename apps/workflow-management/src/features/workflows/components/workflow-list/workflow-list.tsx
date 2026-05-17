import { useMessageBox } from "@/components/containers/messagebox-provider";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@common/components/ldc-seo/use-seo";
import { ColumnDef, DataTable, SortableHeader } from "@common/components/ldc-table";
import { toast } from "@common/components/ldc-toast";
import { cn } from "@common/lib/utils";
import { Button } from "@ldc/ui/components/button";
import { Switch } from "@ldc/ui/components/switch";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDeleteWorkflow, useModifyMainFlowWorkflow, useWorkflowList, workflowKey } from "../../hooks/apis/workflows";
import useSearchParamsQuery from "../../hooks/use-search-params-query";
import { IWorkflow, IWorkflowListResponse, IWorkflowParams } from "../../types/workflows";
import WorkflowRenameDescriptionModal from "../modals/workflow-rename-description-modal";
import WorkflowRenameModal from "../modals/workflow-rename-modal";
import WorkflowRenameRoutingPathModal from "../modals/workflow-rename-routing-modal";
import MenuConfigSetting, { MenuActionEnum } from "../workflow-header-action/more-config-menu";
import WorkflowFilter from "./workflow-filter";

export interface IWorkflowListProps {
    isActive?: boolean
}

const WorkflowList = ({ isActive }: IWorkflowListProps) => {

    const { t } = useLanguage();

    const { searchQueryParams, setSearch, setCurrentPage, setSorting, setMainFlow } = useSearchParamsQuery({ defaultSorting: [{ id: "created_at", desc: true }] })

    const params: IWorkflowParams = useMemo(() => {
        const { currentPage, limit, search, sorting } = searchQueryParams;

        const queryParams: IWorkflowParams = {
            $skip: (currentPage - 1) * limit,
            $top: limit,
        };

        if (search) {
            queryParams.$filter = `contains(name, '${search}')`;
        }

        if (searchQueryParams.mainFlow) {
            queryParams.$filter = queryParams.$filter ? `${queryParams.$filter} and main_flow eq true`
                : `main_flow eq true`;
        }

        if (sorting && sorting.length > 0) {
            const sort = sorting[0];
            queryParams.$orderby = `${sort.id} ${sort.desc ? "desc" : "asc"}`;
        }

        return queryParams;
    }, [searchQueryParams])

    const { data: workflowResponse, isLoading, isFetching, refetch } = useWorkflowList(params, {
        enabled: !!isActive,
        placeholderData: keepPreviousData
    })

    const [rowAction, setRowAction] = useState<{
        row: IWorkflow | null,
        action: string
    }>({
        row: null,
        action: ""
    })

    const tableData = useMemo(() => {
        const search = searchQueryParams.search?.toLowerCase() ?? "";
        if (!search) {
            return workflowResponse?.data?.items || []
        }

        return workflowResponse?.data?.items?.filter((workflow) => workflow.name.toLowerCase().includes(search)) || []
    }, [workflowResponse, searchQueryParams.search, isActive])

    const queryClient = useQueryClient()
    const { mutate: deleteWorkflow, isPending: isDeleting } = useDeleteWorkflow({
        onSuccess: () => {
            const { currentPage } = searchQueryParams;
            const currentWorkflowData = queryClient.getQueryData(workflowKey.getAllWorkflows({})) as IWorkflowListResponse
            if (currentWorkflowData?.data?.items?.length === 1 && currentPage > 1) {
                setCurrentPage(Math.max(1, currentPage - 1))
                return
            }
            toast.success(t("notification.success"), t("notification.workflow_deleted_successfully"))
            refetch()
        }
    })

    const showMessageBox = useMessageBox()
    const handleRemoveWorkflow = async (workflowId: string) => {
        const result = await showMessageBox(t("are_you_sure_to_remove_workflow"), t("remove_workflow"))

        if (result) {
            deleteWorkflow(workflowId)
        }
    }

    const onChangeFilter = useCallback((filter: { search: string, mainFlow: boolean }) => {
        setSearch(filter.search)
        setMainFlow(filter.mainFlow)
    }, [setSearch, setMainFlow])

    const pagination: PaginationState = useMemo(() => ({
        pageIndex: searchQueryParams.currentPage - 1,
        pageSize: searchQueryParams.limit,
    }), [searchQueryParams.currentPage, searchQueryParams.limit])

    const handlePaginationChange = useCallback((state: PaginationState) => {
        setCurrentPage(state.pageIndex + 1)
    }, [setCurrentPage])

    const { mutate: updateWorkflow } = useModifyMainFlowWorkflow({
        onError: (_, variables) => {
            queryClient.setQueryData(workflowKey.getAllWorkflows(params), (oldData: IWorkflowListResponse) => {
                const updatedData = oldData?.data?.items?.map((workflow) => {
                    if (workflow.id === variables.workflowId) {
                        return {
                            ...workflow,
                            main_flow: !variables.main_flow
                        }
                    }
                    return workflow
                })
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        items: updatedData
                    }
                }
            })
        }
    })
    const handleMainFlowChange = useCallback(async (workflowId: string, checked: boolean) => {

        if (!checked) {
            const result = await showMessageBox(t("are_you_sure_to_remove_workflow_from_main_flow"), t("modify_main_flow"))
            if (!result) return
        }

        updateWorkflow({ workflowId, main_flow: checked })
        queryClient.setQueryData(workflowKey.getAllWorkflows(params), (oldData: IWorkflowListResponse) => {
            console.log(oldData?.data?.items);
            const updatedData = oldData?.data?.items?.map((workflow) => {
                if (workflow.id === workflowId) {
                    return {
                        ...workflow,
                        main_flow: checked
                    }
                }
                return workflow
            })
            return {
                ...oldData,
                data: {
                    ...oldData.data,
                    items: updatedData
                }
            }
        })
    }, [params])

    const columns = useMemo((): ColumnDef<IWorkflow>[] => [
        {
            accessorKey: "name",
            header: () => t("workflow_name"),
            minSize: 400,
            cell: ({ row }) => (
                <Link to={`/workflow/${row.original.id}`} state={{ listSearch: searchQueryParams }}>
                    <span className="text-primary hover:underline font-medium">
                        {row.original.name}
                    </span>
                </Link>
            ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <SortableHeader column={column} title={t("created_at")} />,
            meta: { align: "left" },
            maxSize: 150,
            cell: ({ row }) => (
                <span className="whitespace-nowrap">
                    {row.original.created_at
                        ? format(row.original.created_at, "yyyy, MMMM dd hh:mm a", { locale: enGB })
                        : "—"}
                </span>
            ),
        },
        {
            accessorKey: "main_flow",
            header: t("main_flow"),
            maxSize: 50,
            cell: ({ row }) => (
                <Switch checked={row.original.main_flow} onCheckedChange={(checked) => handleMainFlowChange(row.original.id, checked)} />
            ),
        },
        {
            id: "actions",
            header: () => null,
            maxSize: 50,
            fixed: "right",
            meta: { align: "center", neverHide: true },
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveWorkflow(row.original.id)}
                        disabled={isDeleting}
                    >
                        <Trash2Icon className="size-4" />
                    </Button>

                    <MenuConfigSetting onAction={(action) => setRowAction({ row: row.original, action })}>
                        <Button
                            variant="ghost"
                            size="icon"
                        >
                            <MoreHorizontalIcon className="size-4" />
                        </Button>
                    </MenuConfigSetting>
                </div>
            ),
        },
    ], [t, isDeleting, searchQueryParams])

    useSeo({
        title: t("workflows_tab_title"),
        description: t("workflows_seo_description")
    })

    return (
        <>
            <section className="flex flex-col h-full overflow-hidden gap-4 p-4">
                <WorkflowFilter
                    filter={{
                        search: searchQueryParams.search ?? "",
                        mainFlow: searchQueryParams.mainFlow === true
                    }}
                    onChangeFilter={onChangeFilter}
                />

                <div
                    className={cn(
                        "flex-2 overflow-hidden",
                        "transition-opacity",
                        isFetching || isDeleting ? "opacity-60 pointer-events-none" : ""
                    )}
                >
                    {(isLoading || isFetching || isDeleting) && (
                        <div className="loader-bar w-full" />
                    )}
                    <DataTable<IWorkflow>
                        data={tableData}
                        columns={columns}

                        sorting={searchQueryParams.sorting}
                        onSortingChange={setSorting}

                        enablePagination
                        manualPagination
                        pagination={pagination}
                        rowCount={workflowResponse?.data?.total ?? 0}
                        onPaginationChange={handlePaginationChange}
                    />
                </div>
            </section>

            <WorkflowRenameModal
                open={rowAction?.action === MenuActionEnum.ReplaceName}
                defaultValues={{ name: rowAction?.row?.name ?? "", id: rowAction?.row?.id }}
                onOpenChange={(open) => {
                    if (open) return;

                    setRowAction({ row: null, action: "" })
                }
                }
                onSaved={() => {
                    setRowAction({ row: null, action: "" })
                    queryClient.invalidateQueries({ queryKey: workflowKey.all });
                }}
            />

            <WorkflowRenameDescriptionModal
                open={rowAction?.action === MenuActionEnum.ReplaceDescription}
                defaultValues={{ id: rowAction?.row?.id, description: rowAction?.row?.description ?? "" }}
                onOpenChange={(open) => {
                    if (open) return;

                    setRowAction({ row: null, action: "" })
                }
                }
                onSaved={() => {
                    setRowAction({ row: null, action: "" })
                    queryClient.invalidateQueries({ queryKey: workflowKey.all });
                }}
            />

            <WorkflowRenameRoutingPathModal
                open={rowAction?.action === MenuActionEnum.SettingRoutingPath}
                defaultValues={{ id: rowAction?.row?.id, routing_path: rowAction?.row?.routing_path ?? "" }}
                onOpenChange={(open) => {
                    if (open) return;

                    setRowAction({ row: null, action: "" })
                }
                }
                onSaved={() => {
                    setRowAction({ row: null, action: "" })
                    queryClient.invalidateQueries({ queryKey: workflowKey.all });
                }}
            />

        </>
    )
}

export default WorkflowList