import { IVariableSuggestionSource, IWorkflowArtifact } from "@/features/workflows/types/workflows"
import { BaseNode } from "@common/components/ldc-workflow-editor/components/rete-editor/nodes/base-node"
import { BuilderRef } from "@ldc/autoform"
import { createContext, RefObject, useContext } from "react"

interface INodeDetailContext {
    isRunNodeLoading?: boolean
    loadingNodeId?: string | null
    outputSchemaData?: Record<string, any>
    isLoadingOutputSchema?: boolean
    builderRef?: RefObject<BuilderRef | null>
    artifactInputs?: IVariableSuggestionSource
    outputArtifacts?: IWorkflowArtifact[]
    closeNodeDetail: () => void
    onSelectNode: (node: BaseNode) => void
    onExecuteNode: (nodeId: string) => void
    removeConnection: ({ sourceId, targetId }: { sourceId?: string, targetId?: string }) => void
    updateNodeView: (nodeId: string) => void

    variablesInputs: IVariableSuggestionSource[]
    isLoadingInput?: boolean
    refetchVariableInput: () => void
}

interface INodeDetailProviderProps {
    children: React.ReactNode
    value: INodeDetailContext
}

const Context = createContext<INodeDetailContext>({
    variablesInputs: [],
    outputArtifacts: [],
    onSelectNode: () => { },
    onExecuteNode: () => { },
    removeConnection: () => { },
    closeNodeDetail: () => { },
    refetchVariableInput: () => { },
    updateNodeView: () => { },
})

const NodeDetailProvider = ({ children, value }: INodeDetailProviderProps) => {
    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}

export const useNodeDetailContext = () => {
    return useContext(Context)
}

export default NodeDetailProvider