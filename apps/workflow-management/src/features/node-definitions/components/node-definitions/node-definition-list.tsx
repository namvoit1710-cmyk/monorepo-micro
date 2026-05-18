import { useMessageBox } from "@/components/containers/messagebox-provider";
import { useLanguage } from "@/hooks/use-language";
import { ColumnDef, DataTable } from "@ldc/data-table";
import { useQueryClient } from "@ldc/tanstack-query";
import { cn } from "@ldc/ui";
import { toast } from "@ldc/ui/blocks/toast/toast";
import { Button } from "@ldc/ui/components/button";
import { Input } from "@ldc/ui/components/input";
import { DynamicNodeIcon } from "@ldc/workflow-editor";
import { SearchIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { nodepalleteKey } from "../../../workflows/hooks/apis/node-pallete";
import { nodeDefinitionKey, useDeleteNodeDefinition, useNodeDefinitionList } from "../../hooks/apis/node-definitions";
import { INodeDefinition } from "../../types/node-definition";

interface INodeDefinitionColumnDef extends INodeDefinition { _id: string; }

const NodeDefinitionList = () => {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");

    const { data: definitionsResponse, isLoading, isFetching, refetch } = useNodeDefinitionList(
        { tenant_id: "system" }
    );

    const queryClient = useQueryClient();
    const { mutate: deleteDefinition, isPending: isDeleting } = useDeleteNodeDefinition({
        onSuccess: () => {
            toast.success(t("notification.success"), t("node_definitions.deleted_successfully"));
            queryClient.invalidateQueries({ queryKey: nodeDefinitionKey.all });
            queryClient.invalidateQueries({ queryKey: nodepalleteKey.getAllNodePalletes() });
            refetch();
        },
        onError: () => {
            toast.error(t("notification.error"), t("node_definitions.delete_failed"));
        }
    });

    const showMessageBox = useMessageBox();
    const handleDelete = async (definition: INodeDefinition) => {
        const result = await showMessageBox(
            t("node_definitions.confirm_delete", { name: definition.name }),
            t("node_definitions.delete_title")
        );

        if (result) {
            deleteDefinition(definition.id);
        }
    };

    const filteredDefinitions = useMemo(() => {
        const definitions = definitionsResponse?.data?.items ?? [];
        if (!search) return definitions;

        const lowerSearch = search.toLowerCase();
        return definitions.filter(
            (d: any) =>
                d.name.toLowerCase().includes(lowerSearch) ||
                d.description?.toLowerCase().includes(lowerSearch) ||
                d.tags?.some((tag: string) => tag.toLowerCase().includes(lowerSearch))
        );
    }, [definitionsResponse, search]);

    const columns = useMemo((): ColumnDef<INodeDefinitionColumnDef>[] => [
        {
            accessorKey: "name",
            header: () => t("node_definitions.name"),
            cell: ({ row }) => {
                const definition = row.original;
                return (
                    <Link to={`/node-definitions/${definition.id}`}>
                        <div className="flex items-center gap-3">
                            <div
                                className="p-1 rounded-md"
                                style={{
                                    color: definition.color,
                                    backgroundColor: definition.color
                                        ? `color-mix(in srgb, ${definition.color} 10%, transparent)`
                                        : undefined,
                                }}
                            >
                                <DynamicNodeIcon
                                    name={definition.icon ?? "box"}
                                    fallbackIconName="box"
                                    className="size-5"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-primary hover:underline">{definition.name}</span>
                                {definition.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                        {definition.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            },
        },
        {
            accessorKey: "base_worker_id",
            header: () => t("node_definitions.base_worker"),
            maxSize: 200,
            cell: ({ row }) => (
                <span className="text-sm">{row.original.base_worker_id}</span>
            ),
        },
        {
            accessorKey: "tags",
            header: () => t("node_definitions.tags"),
            maxSize: 200,
            cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    {row.original.tags?.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => null,
            maxSize: 50,
            meta: { align: "right", neverHide: true },
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(row.original)}
                    disabled={isDeleting}
                >
                    <Trash2Icon className="size-4" />
                </Button>
            ),
        },
    ], [t, isDeleting]);

    return (
        <section className="flex flex-col gap-4 px-4">
            <div className="flex items-center justify-end">
                <div className="relative min-w-[400px]">
                    <Input
                        className="pl-10"
                        placeholder={t("node_definitions.search_placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
            </div>

            <div className={cn("transition-opacity", isFetching || isDeleting ? "opacity-60 pointer-events-none" : "")}>
                {(isLoading || isFetching || isDeleting) && (
                    <div className="loader-bar w-full" />
                )}
                <DataTable
                    data={filteredDefinitions.map((d) => ({ ...d, _id: d.id }))}
                    columns={columns}
                />
            </div>
        </section>
    );
};

export default NodeDefinitionList;
