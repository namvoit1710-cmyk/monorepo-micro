
import { useEditorStore } from "@/features/workflows/stores/editor-stores"
import type { IArtifactVariableSuggestionSource, IVariableSuggestionSource } from "@/features/workflows/types/workflows"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@ldc/ui"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ldc/ui/components/accordion"
import { useMemo } from "react"
import { useNodeDetailContext } from "./node-detail-provider"
import { UpstreamNodes } from "./upstream-item"
import VariablesContextGroup from "./variables-context-group"

const isArtifactVariableSuggestionSource = (
    item: IVariableSuggestionSource
): item is IArtifactVariableSuggestionSource => {
    return item.node_id === null && item.node_name === "artifacts"
}

const NodeDetailInput = () => {
    const { t } = useLanguage()

    const { isRunNodeLoading, loadingNodeId, variablesInputs, artifactInputs, isLoadingInput, refetchVariableInput } = useNodeDetailContext()
    const selectedNodeId = useEditorStore(s => s.selectedNode?.id)
    const predecessorNodes = useEditorStore(s => s.predecessorNodes)

    const isUpstreamLoading = isRunNodeLoading && loadingNodeId !== selectedNodeId;

    const invalidVariablesInputs = useMemo(() => {
        return variablesInputs.filter(item => !!item.node_id)
    }, [variablesInputs])

    const hasUpstreamNodes = useMemo(() => {
        return predecessorNodes?.length > 0
    }, [predecessorNodes])

    return (
        <div className="flex flex-col gap-4 w-full h-full overflow-hidden!">
            <div className="flex items-center justify-between">
                <h5 className="uppercase font-semibold">{t("nodes.nodes_popup_input")}</h5>
            </div>

            <div className="relative h-full flex-2 w-full overflow-hidden">
                <div
                    className={cn(
                        "h-full w-full overflow-auto pr-2",
                        (!hasUpstreamNodes) && "flex-2 overflow-hidden"
                    )}
                >
                    {!hasUpstreamNodes && (
                        <>
                            <div className="flex-2 flex items-center justify-center h-full">
                                <span className="text-sm text-gray-500">{t("nodes.nodes_popup_no_upstream_nodes")}</span>
                            </div>
                        </>
                    )}

                    {hasUpstreamNodes && (
                        <>
                            <UpstreamNodes
                                nodes={predecessorNodes}
                                variableNodes={invalidVariablesInputs}
                                reloadInputSchema={refetchVariableInput}
                            />

                        </>
                    )}

                    <Accordion type="single" defaultValue="variables-contexts" collapsible className="w-full">
                        <AccordionItem value="variables-contexts" className="border-0">
                            <AccordionTrigger className="justify-start [&>svg]:order-first hover:no-underline cursor-pointer hover:bg-gray-100 py-2 rounded-md">
                                <span className="flex items-center gap-4 pl-2">
                                    <span>{t("nodes.nodes_popup_variables_contexts")}</span>
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-3">
                                <VariablesContextGroup artifacts={artifactInputs!} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </div>

                {(isUpstreamLoading || isLoadingInput) && (
                    <div className="absolute inset-0 h-full bg-white/50 backdrop-blur-xs z-30 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default NodeDetailInput
