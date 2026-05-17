import { useEditorStore } from "@/features/workflows/stores/editor-stores";
import DynamicNodeIcon from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/components/dynamic-node-icon";
import { Button } from "@common/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@common/components/ui/tooltip";
import { useNodeDetailContext } from "./node-detail-provider";

const OutcomerNodes = () => {
    const outcomerNodes = useEditorStore(s => s.outgoerNodes);


    const { onSelectNode } = useNodeDetailContext()

    return (
        <TooltipProvider>
            <section className="absolute top-0 -right-6 w-12 h-full flex flex-col items-center justify-evenly gap-4 py-12">
                {outcomerNodes.map(node => (
                    <Tooltip key={node.id}>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shadow border border-gray-200"
                                onClick={() => {
                                    onSelectNode(node)
                                }}
                            >
                                <DynamicNodeIcon name={node.original.icon} color={node.original.color} className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>{node?.original?.title}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </section>
        </TooltipProvider>
    )
}

export default OutcomerNodes;