import type { BaseNode } from "@ldc/workflow-editor"
import type { NodeExecutionStatus } from "./execution"
import type { INodeCatalogDetail } from "./node-pallete"
import type { IArtifactVariableSuggestionSource, IVariableSuggestionSource } from "./workflows"


export type IOutputSchemaHierarchical = unknown

export interface IScopedVariable {
    label: string
    scopeType: string
    scopeId: string
    expressionPrefix: string
    paths: Record<string, {
        sample: unknown
        displayPath: string
        kind: string
        outputType: string
    }>
    artifacts: unknown[]
    hasFileData: boolean
    fileId: string | null
    columns: string[]
    previewRows: any[]
}

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

    // New scoped variables structure
    scopedVariables: IScopedVariable[]
    isLoadingInput?: boolean
    refetchVariableInput: () => void

    // Legacy fields for backward compatibility
    artifactInputs: IArtifactVariableSuggestionSource | undefined
    variablesInputs: IVariableSuggestionSource[]

    nodeDetail: INodeCatalogDetail | undefined
    isNodeDetailLoading: boolean
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
