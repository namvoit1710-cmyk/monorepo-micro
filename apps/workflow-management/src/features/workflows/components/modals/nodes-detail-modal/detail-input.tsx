import { useEditorStore } from "@/features/workflows/stores/editor-stores"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@ldc/ui"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ldc/ui/components/accordion"
import { useMemo } from "react"
import ArtifactItem from "./artifact-item"
import InputSchema from "./input-schema"
import { useNodeDetailContext } from "./node-detail-provider"
import { UpstreamNodes } from "./upstream-item"

const NodeDetailInput = () => {
    const { t } = useLanguage()

    const {
        isRunNodeLoading,
        loadingNodeId,
        scopedVariables,
        isLoadingInput,
        refetchVariableInput
    } = useNodeDetailContext()
    const selectedNode = useEditorStore(s => s.selectedNode)
    const selectedNodeId = selectedNode?.id
    const predecessorNodes = useEditorStore(s => s.predecessorNodes)

    const isUpstreamLoading = isRunNodeLoading && loadingNodeId !== selectedNodeId

    const nodeVariablesInputs = useMemo(() => {
        return scopedVariables.filter(item => item.scopeType !== "input" && item.scopeType !== "artifacts")
    }, [scopedVariables])

    const inputVariablesInputs = useMemo(() => {
        return scopedVariables.find(item => item.scopeType === "input")
    }, [scopedVariables])

    const artifactVariablesInputs = useMemo(() => {
        return scopedVariables.find(item => item.scopeType === "artifacts")
    }, [scopedVariables])

    console.log("artifactVariablesInputs", scopedVariables)

    const hasUpstreamNodes = useMemo(() => {
        return predecessorNodes?.length > 0
    }, [predecessorNodes])

    return (
        <div className="flex flex-col gap-4 w-full h-full overflow-hidden!">
            <div className="flex items-center justify-between px-1.5">
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
                                variableNodes={nodeVariablesInputs}
                                reloadInputSchema={refetchVariableInput}
                            />
                        </>
                    )}

                    {!!inputVariablesInputs && (
                        <Accordion type="multiple" className="w-full mt-4">
                            <AccordionItem key={inputVariablesInputs.scopeId} value={inputVariablesInputs.scopeId} className="border-0">
                                <AccordionTrigger className="justify-start px-1 w-full hover:no-underline cursor-pointer hover:bg-gray-100 py-2 rounded-md">
                                    <span className="flex items-center gap-2 flex-2">
                                        <span className="font-medium">{inputVariablesInputs.label}</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 py-2">
                                    {!!Object.keys(inputVariablesInputs.paths).length && (
                                        <InputSchema scopePath={inputVariablesInputs.paths} />
                                    )}

                                    {!Object.keys(inputVariablesInputs.paths).length && (
                                        <span className="text-sm text-gray-500 text-center block">
                                            {t("nodes.nodes_popup_no_input_data")}
                                        </span>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    )}

                    {!!artifactVariablesInputs && (
                        <Accordion type="multiple" className="w-full mt-4">
                            <AccordionItem key={artifactVariablesInputs.scopeId} value={artifactVariablesInputs.scopeId} className="border-0">
                                <AccordionTrigger className="justify-start px-1 w-full hover:no-underline cursor-pointer hover:bg-gray-100 py-2 rounded-md">
                                    <span className="flex items-center gap-2 flex-2">
                                        <span className="font-medium">{artifactVariablesInputs.label}</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 py-2">
                                    <ArtifactItem paths={artifactVariablesInputs.paths} enableDragKey />
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    )}
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
