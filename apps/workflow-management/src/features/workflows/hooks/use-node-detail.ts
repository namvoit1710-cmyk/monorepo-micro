import { useMemo } from "react"
import { useEditorStore } from "../stores/editor-stores"
import { useUIPanelStore } from "../stores/ui-panel-stores"
import type { NodeExecutionStatus } from "../types/execution"
import type { IUseNodeDetailReturn } from "../types/node-detail"
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

    // Transform scopes to simplified structure
    const scopedVariables = useMemo(() => {
        if (!nodeVariableResponse?.data?.scopes) return []

        return nodeVariableResponse.data.scopes
            .filter(scope =>
                scope.scope_type !== "variables" &&
                scope.scope_type !== "run" &&
                scope.scope_type !== "workflow"
            )
            .map(scope => ({
                label: scope.label,
                scopeType: scope.scope_type,
                scopeId: scope.scope_id,
                expressionPrefix: scope.expression_prefix,
                paths: (scope.paths || []).reduce((acc, pathItem) => {
                    acc[pathItem.label] = {
                        sample: pathItem.sample,
                        displayPath: pathItem.display_path,
                        kind: pathItem.kind,
                        outputType: pathItem.output_type,
                    }
                    return acc
                }, {} as Record<string, any>),
                artifacts: scope.artifacts || [],
                hasFileData: scope.has_file_data,
                fileId: scope.file_id,
                columns: scope.columns || [],
                previewRows: scope.preview_rows || [],
            }))
    }, [nodeVariableResponse])

    // Legacy compatibility - convert scopes back to old format
    const legacyArtifacts = useMemo(() => {
        const artifactsScope = nodeVariableResponse?.data?.scopes?.find(
            scope => scope.scope_type === "artifacts"
        )
        if (!artifactsScope) return undefined
        return {
            node_id: null,
            node_name: "artifacts",
            node_type: "",
            expression_prefix: artifactsScope.expression_prefix,
            paths: artifactsScope.paths,
            has_file_data: artifactsScope.has_file_data,
            file_id: artifactsScope.file_id,
            columns: artifactsScope.columns,
            preview_rows: artifactsScope.preview_rows,
            artifacts: artifactsScope.artifacts,
        } as any
    }, [nodeVariableResponse])

    const legacySources = useMemo(() => {
        if (!nodeVariableResponse?.data?.scopes) return []
        return nodeVariableResponse.data.scopes
            .filter(scope => scope.scope_type === "node")
            .map(scope => ({
                node_id: scope.scope_id,
                node_name: scope.label,
                node_type: scope.node_type || "",
                expression_prefix: scope.expression_prefix,
                paths: scope.paths,
                has_file_data: scope.has_file_data,
                file_id: scope.file_id,
                columns: scope.columns,
                preview_rows: scope.preview_rows,
                artifacts: scope.artifacts,
            }))
    }, [nodeVariableResponse])

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
        scopedVariables,
        artifactInputs: legacyArtifacts,
        isLoadingInput: isLoadingVariable,
        variablesInputs: legacySources,
        isLoadingOutputSchema,
    }
}

export default useNodeDetail