import { useLanguage } from "@/components/containers/language-provider";
import { WORKFLOW_EXECUTION_STATUS_OPTIONS } from "@/constants/workflows";
import { Button } from "@common/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@common/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { Spinner } from "@common/components/ui/spinner";
import { useDebounceCallback } from "@common/hooks/use-debounce-callback";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWorkflowListInfinite } from "../../hooks/apis/workflows";

export interface IExecutionFilterProps {
    isActive?: boolean;
    initialFilter?: {
        workflowId: string;
        executionStatus: string;
    };
    setWorkflowId: (workflowId: string) => void;
    setExecutionStatus: (executionStatus: string) => void;
}

const ExecutionFilter = ({ isActive, initialFilter, setWorkflowId, setExecutionStatus }: IExecutionFilterProps) => {
    const { workflowId, executionStatus } = initialFilter || {};

    const { t } = useLanguage();

    const [workflowOpen, setWorkflowOpen] = useState(false);
    const [workflowSearch, setWorkflowSearch] = useState("");
    const [debouncedWorkflowSearch, setDebouncedWorkflowSearch] = useState("");
    const debouncedSetWorkflowSearch = useDebounceCallback(setDebouncedWorkflowSearch, 300);

    const {
        data: workflowInfiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useWorkflowListInfinite(
        {
            $filter: debouncedWorkflowSearch ? `contains(name, '${debouncedWorkflowSearch}')` : undefined,
        },
        { enabled: isActive }
    );

    const workflowOptions = useMemo(() => {
        const pages = workflowInfiniteData?.pages ?? [];
        return pages.flatMap((page) => page.data.items ?? []).map((w) => ({
            value: w.id,
            label: w.name,
        }));
    }, [workflowInfiniteData]);

    const sentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const selectedWorkflowLabel = useMemo(() => {
        if (!workflowId || workflowId === "all") return t("all_workflows");
        return workflowOptions.find((o) => o.value === workflowId)?.label ?? workflowId;
    }, [workflowId, workflowOptions, t]);

    const [statusOpen, setStatusOpen] = useState(false);

    const selectedStatusLabel = useMemo(() => {
        if (!executionStatus) return t("all_statuses");
        return WORKFLOW_EXECUTION_STATUS_OPTIONS.find((o) => o.value === executionStatus)?.label ?? executionStatus;
    }, [executionStatus, t]);

    return (
        <div className="flex items-center gap-3 justify-end">
            <Popover
                open={workflowOpen}
                onOpenChange={(o) => {
                    setWorkflowOpen(o);
                    if (!o) {
                        setWorkflowSearch("");
                        setDebouncedWorkflowSearch("");
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={workflowOpen}
                        className="min-w-[200px] justify-between font-normal"
                    >
                        <span className="truncate">{selectedWorkflowLabel}</span>
                        <ChevronDownIcon
                            className="text-muted-foreground/80 ml-2 size-4 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="min-w-[250px] p-0" align="end" side="bottom">
                    <Command shouldFilter={false} className="space-y-2">
                        <CommandInput
                            placeholder={t("search_workflow")}
                            value={workflowSearch}
                            onValueChange={(val) => {
                                setWorkflowSearch(val);
                                debouncedSetWorkflowSearch(val);
                            }}
                        />

                        <CommandList>
                            <CommandEmpty>{t("no_workflows_found")}</CommandEmpty>

                            <CommandItem
                                value="all"
                                data-checked={!workflowId || workflowId === "all"}
                                onSelect={() => {
                                    setWorkflowId("all");
                                    setWorkflowOpen(false);
                                }}
                            >
                                {t("all_workflows")}
                            </CommandItem>

                            {workflowOptions.map((workflow) => (
                                <CommandItem
                                    key={workflow.value}
                                    value={workflow.value}
                                    data-checked={workflowId === workflow.value}
                                    onSelect={() => {
                                        setWorkflowId(workflow.value);
                                        setWorkflowOpen(false);
                                    }}
                                >
                                    {workflow.label}
                                </CommandItem>
                            ))}

                            <div ref={sentinelRef} className="h-px" />

                            {isFetchingNextPage && (
                                <div className="flex justify-center py-2">
                                    <Spinner className="size-4" />
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={statusOpen}
                        className="min-w-[160px] justify-between font-normal"
                    >
                        <span className="truncate">{selectedStatusLabel}</span>
                        <ChevronDownIcon
                            className="text-muted-foreground/80 ml-2 size-4 shrink-0"
                            aria-hidden="true"
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[160px] p-0" align="end" side="bottom">
                    <Command>
                        <CommandList>
                            <CommandItem
                                value=""
                                data-checked={!executionStatus}
                                onSelect={() => {
                                    setExecutionStatus("");
                                    setStatusOpen(false);
                                }}
                            >
                                {t("all_statuses")}
                            </CommandItem>

                            {WORKFLOW_EXECUTION_STATUS_OPTIONS.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    data-checked={executionStatus === option.value}
                                    onSelect={() => {
                                        setExecutionStatus(option.value);
                                        setStatusOpen(false);
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default ExecutionFilter;
