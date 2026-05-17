import { useEditorStore } from "@/features/workflows/stores/editor-stores";
import { useLanguage } from "@/hooks/use-language";
import { BaseNode } from "@common/components/ldc-workflow-editor/components/rete-editor";
import { cn } from "@common/lib/utils";

import JsonView from "@/components/json-view/json-view";
import { IVariableSuggestionSource } from "@/features/workflows/types/workflows";
import { DynamicNodeIcon } from "@ldc/workflow-editor";
import { LoadingSpin } from "@ldc/workflow-editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ldc/ui/components/accordion";
import { isEmpty } from "lodash-es";
import { PlayIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNodeDetailContext } from "./node-detail-provider";

interface IUpstreamNodesProps {
    nodes: BaseNode[]
    variableNodes: IVariableSuggestionSource[]
    reloadInputSchema: () => void
}

const UpstreamNodes = ({ nodes, variableNodes, reloadInputSchema }: IUpstreamNodesProps) => {
    const variableByNodeId = useMemo(() => {
        return variableNodes.reduce(
            (acc: Record<string, IVariableSuggestionSource>, node: IVariableSuggestionSource) => {
                acc[node.node_id] = node
                return acc
            }, {})
    }, [variableNodes])

    return (
        <Accordion type="multiple" defaultValue={nodes.map(node => node.id)} className="w-full">
            {nodes.map(node => (
                <AccordionItem key={node.id} value={node.id} className="border-0">
                    <AccordionTrigger className="justify-start [&>svg]:order-first hover:no-underline cursor-pointer hover:bg-gray-100 py-2 rounded-md">
                        <span className="flex items-center gap-2 pl-2">
                            <DynamicNodeIcon name={node?.original?.icon} color={node?.original?.color} className="size-5" />
                            <span>{node?.original?.title}</span>
                        </span>
                    </AccordionTrigger>

                    <AccordionContent className="px-3 py-2">
                        <UpstreamNodeItem node={node} reloadInputSchema={reloadInputSchema} variableNode={variableByNodeId[node.id]} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

interface IUpstreamNodeItemProps {
    node: BaseNode
    variableNode: IVariableSuggestionSource
    reloadInputSchema: () => void
}

const UpstreamNodeItem = ({ node, variableNode, reloadInputSchema }: IUpstreamNodeItemProps) => {

    const { t } = useLanguage()

    const { onExecuteNode, isRunNodeLoading } = useNodeDetailContext()
    const variableNodeObject = useMemo(() => variableNode?.columns?.reduce((acc, column) => {
        acc[column] = variableNode.preview_rows?.[0]?.[column] ?? ""
        return acc
    }, {} as Record<string, string>), [variableNode])

    const hasVariableNode = useMemo(() => !!variableNode && !isEmpty(variableNodeObject), [variableNodeObject])

    const nodeExecutionMap = useEditorStore(s => s.nodeExecutionMap)

    const upstreamNodeStatus = useMemo(() => nodeExecutionMap[node.id]?.status ?? "idle", [nodeExecutionMap, node.id])
    const isIdleStatus = useMemo(() => upstreamNodeStatus === "idle", [upstreamNodeStatus])
    const isExecuting = useMemo(() => upstreamNodeStatus === "executing", [upstreamNodeStatus])
    const showInputSchema = useMemo(() => upstreamNodeStatus === "completed", [upstreamNodeStatus])

    useEffect(() => {
        if (showInputSchema) {
            reloadInputSchema()
        }
    }, [showInputSchema])

    return (
        <>
            {(isIdleStatus || !hasVariableNode) && (
                <div className="space-x-1">
                    <span
                        className={cn(
                            "cursor-pointer inline-flex items-center gap-1 p-1 hover:border-blue-500 justify-center border border-gray-300 rounded-md w-fit hover:text-blue-500",
                            (isRunNodeLoading || isExecuting) && "pointer-events-none opacity-50"
                        )}
                        onClick={() => onExecuteNode(node.id)}
                    >
                        <span className="flex items-center justify-center">
                            {(isExecuting || isRunNodeLoading) ?
                                <LoadingSpin /> :
                                <PlayIcon className="size-4" />
                            }
                        </span>
                        <span className="text-sm inline-block">{t("nodes.execute_previous_node")}</span>
                    </span>

                    <span className="text-sm">{t("nodes.to_view_input_data")}</span>
                </div>
            )}

            {hasVariableNode && !isIdleStatus && (
                <JsonView
                    value={variableNodeObject}
                    prefix={`${variableNode.expression_prefix}.#path}}`}
                    enableClipboard={false}
                    draggableKeys={true}
                />
            )}
        </>
    )
}

export { UpstreamNodeItem, UpstreamNodes };

