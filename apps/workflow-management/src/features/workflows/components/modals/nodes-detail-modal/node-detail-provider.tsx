import type { IUseNodeDetailReturn } from "@/features/workflows/types/node-detail";
import type { BuilderRef } from "@ldc/autoform";
import type { BaseNode } from "@ldc/workflow-editor";
import type { RefObject } from "react";
import { createContext, useContext } from "react";

interface INodeDetailContext extends IUseNodeDetailReturn {
    isRunNodeLoading?: boolean
    loadingNodeId?: string | null
    builderRef?: RefObject<BuilderRef | null>
    closeNodeDetail: () => void
    onSelectNode: (node: BaseNode) => void
    onExecuteNode: (nodeId: string) => void
    removeConnection: ({ sourceId, targetId }: { sourceId?: string, targetId?: string }) => void
    updateNodeView: (nodeId: string) => void
}

interface INodeDetailProviderProps {
    children: React.ReactNode
    value: INodeDetailContext
}

const Context = createContext<INodeDetailContext>({
    selectedNode: null,
    currentNodeStatus: "idle",
    showOutputSchema: false,
    outputArtifacts: [],
    isLoadingOutputSchema: false,
    scopedVariables: [],
    artifactInputs: undefined,
    refetchVariableInput: () => { },
    variablesInputs: [],
    nodeDetail: {} as any,
    isNodeDetailLoading: false,

    onSelectNode: () => { },
    onExecuteNode: () => { },
    removeConnection: () => { },
    closeNodeDetail: () => { },
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