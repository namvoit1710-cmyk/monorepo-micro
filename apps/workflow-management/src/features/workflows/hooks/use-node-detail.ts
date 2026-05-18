import { useEditorStore } from "../stores/editor-stores"
import { useUIPanelStore } from "../stores/ui-panel-stores"
import type { NodeExecutionStatus } from "../types/execution"
import type { IUseNodeDetailReturn } from "../types/node-comprehensive"
import { useGetNodeDataInfo } from "./apis/node-data"
import { useQueryNodeCatalogDetail } from "./apis/node-pallete"
import { useGetNodeVariableSuggestions } from "./apis/workflows"

const useNodeDetail = (): IUseNodeDetailReturn => {
    const selectedNode = useEditorStore(s => s.selectedNode)
    const nodeExecutionMap = useEditorStore(s => s.nodeExecutionMap)
    const isOpenNodesPopup = useUIPanelStore(s => s.isOpenNodesPopup);
    const runId = useEditorStore(s => s.workflowInfo?.test_run_id)

    const currentNodeId = selectedNode?.id

    const { data: nodeCatalogDetail, isLoading: isNodeDetailLoading } = useQueryNodeCatalogDetail(
        { ref: selectedNode?.original.worker_type ?? "" },
        {
            enabled: !!selectedNode?.original.worker_type,
        }
    )

    const currentNodeStatus: NodeExecutionStatus =
        nodeExecutionMap[currentNodeId ?? ""]?.status ?? "idle"

    const showOutputSchema = currentNodeStatus === "completed" || currentNodeStatus === "failed"

    // const {
    //     data: outputSchema,
    //     isLoading: isLoadingOutputSchema,
    // } = useGetNodeOutput(
    //     {
    //         nodeId: currentNodeId ?? "",
    //         runId: runId ?? "",
    //     },
    //     { 
    //         enabled: showOutputSchema && !!currentNodeId && !!runId,
    //         staleTime: 0
    //      }
    // )
    const { data: outputSchema, isLoading: isLoadingOutputSchema } = useGetNodeDataInfo(
        { runId: runId ?? "", nodeId: currentNodeId ?? "", side: "output" },
        {
            enabled: showOutputSchema && !!currentNodeId && !!runId,
            staleTime: 0,
        }
    )

    // const outputArtifacts = useMemo(() => {
    //     return outputSchema?.data?.artifacts ?? []
    // }, [outputSchema])

    // const outputSchemaData = useMemo<Record<string, any>>(() => {
    //     if (!outputSchema) return {}

    //     const outputSchemaData = outputSchema.data

    //     return outputSchemaData.columns.reduce((acc, column) => {
    //         acc[column] = outputSchemaData.preview_rows[0][column]
    //         return acc
    //     }, {} as Record<string, any>)

    // }, [outputSchema])

    const { data: nodeVariableResponse, isLoading: isLoadingVariable, refetch } = useGetNodeVariableSuggestions({
        runId: runId || "",
        nodeId: currentNodeId || "",
    }, {
        enabled: !!isOpenNodesPopup && !!runId && !!currentNodeId,
    })


    return {
        runId,
        selectedNode,
        currentNodeId,
        currentNodeStatus,
        showOutputSchema,

        outputSchemaData: {},
        outputArtifacts: [],

        nodeDetail: nodeCatalogDetail?.data,
        isNodeDetailLoading,

        refetchVariableInput: refetch,
        artifactInputs: nodeVariableResponse?.data?.artifacts,
        isLoadingInput: isLoadingVariable,
        variablesInputs: nodeVariableResponse?.data?.sources ?? [],
        isLoadingOutputSchema,
    }
}

export default useNodeDetail