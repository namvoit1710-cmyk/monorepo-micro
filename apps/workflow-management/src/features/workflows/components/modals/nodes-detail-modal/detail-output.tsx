
import JsonView from "@/components/json-view/json-view"
import { useDownloadArtifact } from "@/features/workflows/hooks/use-download-artifact"
import { useEditorStore } from "@/features/workflows/stores/editor-stores"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@ldc/ui"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ldc/ui/components/accordion"
import { isEmpty } from "lodash-es"
import { Paperclip } from "lucide-react"
import { useCallback } from "react"
import { useNodeDetailContext } from "./node-detail-provider"

const NodeDetailOutput = () => {
    const { t } = useLanguage()
    const { downloadArtifact, isDownloading } = useDownloadArtifact()

    const selectedNode = useEditorStore(s => s.selectedNode)
    const currentNodeStatus = useEditorStore(
        useCallback(s => s.nodeExecutionMap[selectedNode?.id ?? ""]?.status ?? "idle", [selectedNode?.id])
    );
    const isExecuting = currentNodeStatus === "executing";

    const { outputSchemaData, isLoadingOutputSchema, outputArtifacts } = useNodeDetailContext()

    return (
        <div className="flex flex-col gap-4 w-full h-full overflow-hidden">
            <div className="flex items-center justify-between px-4">
                <h5 className="uppercase font-semibold">{t("nodes.nodes_popup_output")}</h5>
            </div>

            <div className="relative h-full flex-2 w-full overflow-hidden">
                <div
                    className={cn(
                        "h-full w-full overflow-auto px-2",
                        isEmpty(outputSchemaData) && "overflow-hidden"
                    )}
                >
                    {isEmpty(outputSchemaData) && !outputArtifacts?.length && (
                        <div className="flex-2 flex flex-col items-center justify-center h-full">
                            <span className="text-sm text-gray-500 text-center">{t("nodes.nodes_popup_no_output_data")}</span>
                            <span className="text-sm text-gray-500 text-center">{t("nodes.let_run_the_node_to_view_output_data")}</span>
                        </div>
                    )}

                    <Accordion type="multiple" defaultValue={["output-value", "artifacts-value"]}>
                        {!isEmpty(outputSchemaData) &&
                            <AccordionItem value="output-value" className="border-0">
                                <AccordionTrigger className="justify-start [&>svg]:order-first hover:no-underline cursor-pointer hover:bg-gray-100 py-1 rounded-md">
                                    <span className="flex items-center gap-4 pl-2">
                                        <span>{t("nodes.nodes_popup_output")}</span>
                                    </span>
                                </AccordionTrigger>

                                <AccordionContent className="px-3 py-2">
                                    {isEmpty(outputSchemaData) ?
                                        <span className="text-sm text-gray-500 text-center block">
                                            {t("nodes.nodes_popup_no_output_data")}
                                        </span>
                                        :
                                        <JsonView
                                            value={outputSchemaData ?? {}}
                                            enableClipboard={false}
                                        />
                                    }
                                </AccordionContent>
                            </AccordionItem>
                        }

                        {!!outputArtifacts?.length && (<AccordionItem value="artifacts-value" className="border-0">
                            <AccordionTrigger className="justify-start [&>svg]:order-first hover:no-underline cursor-pointer hover:bg-gray-100 py-1 rounded-md">
                                <span className="pl-2 flex items-center gap-2">
                                    <Paperclip className="size-4" />
                                    <span>{t("artifacts")}</span>
                                </span>
                            </AccordionTrigger>

                            <AccordionContent className="px-3 py-2">
                                {!outputArtifacts?.length && (<span className="text-sm text-gray-500 text-center w-full block">{t("no_artifacts")}</span>)}
                                {!!outputArtifacts?.length && (
                                    <div className="flex flex-col gap-2">
                                        {/* {outputArtifacts.map((artifact, index) => (
                                            <ArtifactFileItem
                                                key={artifact.file_id || index}
                                                artifact={artifact}
                                                isDownloading={isDownloading(artifact.file_id)}
                                                onDownload={downloadArtifact}
                                            />
                                        ))} */}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>)}
                    </Accordion>



                </div>

                {(isLoadingOutputSchema || isExecuting) && (
                    <div className="absolute inset-0 h-full bg-white/50 backdrop-blur-xs z-30 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default NodeDetailOutput