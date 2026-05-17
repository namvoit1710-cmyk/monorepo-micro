import { BaseNode } from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/base-node"
import { NodeExecutionStatus } from "./execution"
import { IArtifactVariableSuggestionSource, IVariableSuggestionSource } from "./workflows"


export type IOutputSchemaHierarchical = unknown

export interface IUseNodeDetailReturn {
    // Node identity
    selectedNode: BaseNode | null
    currentNodeId?: string
    runId?: string

    currentNodeStatus: NodeExecutionStatus
    showOutputSchema: boolean

    outputSchemaData?: Record<string, any>
    outputArtifacts: any[]
    isLoadingOutputSchema: boolean

    artifactInputs: IArtifactVariableSuggestionSource
    isLoadingInput?: boolean
    refetchVariableInput: () => void
    variablesInputs: IVariableSuggestionSource[]
}

export interface INodeComprehensiveQueryParams {
    nodeId: string
    runId: string
    offset?: number
    limit?: number
    include_samples?: boolean
    max_depth?: number
    include_params?: boolean
    include_artifacts?: boolean
    include_output_data?: boolean
    include_schema?: boolean
    schema_path?: string
}

export interface ITreeNode {
    key: string
    children?: ITreeNode[]
    sample?: unknown
}

export type INodeComprehensiveData = Record<string, unknown>
