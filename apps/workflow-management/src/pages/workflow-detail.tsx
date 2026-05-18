import Page from "@/components/containers/page";
import { EXECUTION_STATUS, LOG_ACTION } from "@/constants/log";
import LoadingOverlay from "@/features/workflows/components/loading-overlay/loading-overlay";
import ApprovalFlowModal from "@/features/workflows/components/modals/approval-flow-modal/approval-flow-modal";
import WorkflowInteractionModal from "@/features/workflows/components/modals/interaction-modal/components/interaction-modal";
import NodeEditInfoModal from "@/features/workflows/components/modals/node-edit-infor-modal";
import NodesDetailModal from "@/features/workflows/components/modals/nodes-detail-modal/detail-modal";
import NodePalette from "@/features/workflows/components/node-palette/node-palette";
import NodePaletteContent from "@/features/workflows/components/node-palette/palette-content";
import WorkflowDetailHeaderAction from "@/features/workflows/components/workflow-header-action/workflow-header-action";
import LogSection from "@/features/workflows/components/workflow-logs/logs";
import useExecuteWorkflowV2 from "@/features/workflows/hooks/use-execute-workflow-v2";
import { InteractionModalEnum, useInteractionModal } from "@/features/workflows/hooks/use-interaction-modal";
import useSaveWorkflow from "@/features/workflows/hooks/use-save-workflow";
import useSelectNode from "@/features/workflows/hooks/use-select-node";
import { useWorkflowDetail } from "@/features/workflows/hooks/use-workflow-detail-page";
import { useWorkflowLogSync } from "@/features/workflows/hooks/use-workflow-log-sync";
import { useEditorStore } from "@/features/workflows/stores/editor-stores";
import { useUIPanelStore } from "@/features/workflows/stores/ui-panel-stores";
import type { INodePallete } from "@/features/workflows/types/node-pallete";
import { mapNodeToEditorNode } from "@/features/workflows/utils/node-mapper-utils";
import { cn } from "@ldc/ui";
import { Badge } from "@ldc/ui/components/badge";
import type { BaseNode, IEditorValue, WorkflowEditorHandle } from "@ldc/workflow-editor";
import { WorkflowEditor } from "@ldc/workflow-editor";
import { useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

const WorkflowDetailPage = () => {
    const { workflowId } = useParams()

    const workflowEditorRef = useRef<WorkflowEditorHandle | null>(null);

    const { workflow, isLoading } = useWorkflowDetail(workflowId!)

    const { addLightLog, addExecutionLog } = useWorkflowLogSync(workflowId!)

    const { modalState, prompt, dismiss } = useInteractionModal();

    const { onSave, isSaving } = useSaveWorkflow({
        onSaved: ({ timestamp }) =>
            addExecutionLog(LOG_ACTION.WORKFLOW_SAVED, { status: EXECUTION_STATUS.SUCCESS, timestamp }),
    })

    const {
        onRunNode,
        onRunWorkflow,
        stopWorkflow,
        isRunNodeLoading,
        loadingNodeId,
        isRunWorkflowExecuting,
        isPrepareWorkflowExecuting
    } = useExecuteWorkflowV2({
        prompt,
        dismiss,
        editorRef: workflowEditorRef,

        // FOR LOGS
        onNodeCompleted: ({ nodeId, nodeName, timestamp }) =>
            addExecutionLog(LOG_ACTION.NODE_EXECUTED, { status: EXECUTION_STATUS.SUCCESS, nodeId, nodeName, timestamp }),
        onNodeFailed: ({ nodeId, nodeName, timestamp, errorMessage }) =>
            addExecutionLog(LOG_ACTION.NODE_EXECUTED, { status: EXECUTION_STATUS.ERROR, nodeId, nodeName, timestamp, errorMessage }),
        onWorkflowCompleted: ({ timestamp }) =>
            addExecutionLog(LOG_ACTION.WORKFLOW_EXECUTED, { status: EXECUTION_STATUS.SUCCESS, timestamp }),
        onWorkflowFailed: ({ timestamp, errorMessage }) =>
            addExecutionLog(LOG_ACTION.WORKFLOW_EXECUTED, { status: EXECUTION_STATUS.ERROR, timestamp, errorMessage }),
    })

    const workflowData = useEditorStore((s) => s.workflowData);
    const setWorkflowData = useEditorStore((s) => s.setWorkflowData);

    const setIsOpenNodesPopup = useUIPanelStore((s) => s.setIsOpenNodesPopup);
    const isOpenNodeListPanel = useUIPanelStore((s) => s.isOpenNodeListPanel);
    const toggleNodeListPanel = useUIPanelStore((s) => s.toggleNodeListPanel);
    const setIsOpenNodeInfoEditorModal = useUIPanelStore((s) => s.setIsOpenNodeInfoEditorModal);

    const { onSelectedNode } = useSelectNode(workflowEditorRef);

    const openNodePopup = useCallback((node: BaseNode) => {
        setIsOpenNodesPopup(true);
        onSelectedNode(node);
    }, []);

    const handleNodeSelected = useCallback((node: BaseNode) => {
        onSelectedNode(node);
    }, []);

    const handleEditNode = useCallback((node: BaseNode) => {
        onSelectedNode(node);
        setIsOpenNodeInfoEditorModal(true);
    }, [])

    const handleChange = useCallback((value: IEditorValue) => {
        setWorkflowData(value);
    }, []);

    const handleAddNodeFromList = useCallback((nodePallete: INodePallete) => {
        const editorNode = mapNodeToEditorNode(nodePallete);
        workflowEditorRef.current?.addNode?.(editorNode);
    }, []);

    const handleAddNodeClick = useCallback(() => {
        toggleNodeListPanel();
    }, []);

    const removeConnection = useCallback(({ sourceId, targetId }: { sourceId?: string, targetId?: string }) => {
        if (sourceId) {
            workflowEditorRef.current?.removeConnectionBySource?.(sourceId);
        }
        if (targetId) {
            workflowEditorRef.current?.removeConnectionByTarget?.(targetId);
        }
    }, []);

    const updateNodeView = useCallback((nodeId: string) => {
        workflowEditorRef.current?.updateNodeView?.(nodeId);
        workflowEditorRef.current?.serializeAndEmitChange?.();
    }, []);

    const handleRunNode = useCallback(async (nodeId: string) => {
        onRunNode(nodeId)
    }, [onRunNode])

    const handleRunWorkflow = useCallback(async () => {
        onRunWorkflow()
    }, [onRunWorkflow])

    return (
        <>
            {/* <LdcSeo
                title={workflow?.name ? `AI Workflow: ${workflow.name}` : "Workflow Detail - AI Workflow Management"}
                description={workflow?.description || "Workflow Detail Page"}
            /> */}

            <Page className="gap-0">
                <Page.Header
                    title={(
                        workflow?.name && (<div className="flex items-start gap-2">
                            <span>{workflow?.name}</span>
                            <Badge variant={workflow?.main_flow ? "default" : "outline"} className="whitespace-nowrap mt-0.5">{workflow?.main_flow ? "Main Flow" : "Sub Flow"}</Badge>
                        </div>)
                    )}
                    description={workflow?.description}
                    className="border-b"
                    actions={
                        <WorkflowDetailHeaderAction
                            workflowTitle={workflow?.name}

                            isSaving={isSaving}

                            isPrepareWorkflowExecuting={isPrepareWorkflowExecuting}
                            isRunWorkflowExecuting={isRunWorkflowExecuting}

                            onExecute={handleRunWorkflow}
                            onStop={stopWorkflow}
                            onSave={(workflowName) => onSave(workflowId!, workflowName)}
                        />
                    }
                />
                <div
                    className={cn(
                        "relative",
                        "flex flex-col",
                        "overflow-hidden h-full w-full",
                    )}
                >
                    <div className={cn("flex-2 overflow-hidden relative", isSaving && "pointer-events-none opacity-90")}>
                        <WorkflowEditor
                            value={workflowData}
                            ref={workflowEditorRef}
                            onAddNode={handleAddNodeClick}
                            onChange={handleChange}
                            onExecuteNode={(nodeId: string) => handleRunNode(nodeId)}
                            onOpenNodePopup={openNodePopup}
                            onNodeSelected={handleNodeSelected}
                            onNodeAdded={() => addLightLog("NODE_ADDED")}
                            onConnectionAdded={() => addLightLog("CONNECTION_ADDED")}
                            onEditNode={handleEditNode}
                        />

                        <NodePalette
                            side="right"
                            isOpen={isOpenNodeListPanel}
                            onClose={toggleNodeListPanel}
                        >
                            <NodePaletteContent
                                onCloseDrawer={toggleNodeListPanel}
                                onSelectNode={handleAddNodeFromList}
                            />
                        </NodePalette>
                    </div>

                    <LogSection workflowId={workflowId!} />

                    <LoadingOverlay isLoading={isLoading} />
                </div>
            </Page>

            <NodesDetailModal
                onExecuteNode={(nodeId: string) => handleRunNode(nodeId)}
                onSelectNode={handleNodeSelected}
                removeConnection={removeConnection}
                updateNodeView={updateNodeView}

                isRunNodeLoading={isRunNodeLoading}
                loadingNodeId={loadingNodeId}
            />

            {modalState &&
                <>
                    {
                        modalState.payload.type === InteractionModalEnum.APPROVAL_FLOW_VIEWER ? (
                            <ApprovalFlowModal
                                modalState={modalState}
                                open={!!modalState}
                            />
                        ) : (
                            <WorkflowInteractionModal
                                modalState={modalState}
                                open={!!modalState}
                            />
                        )
                    }
                </>
            }

            <NodeEditInfoModal />
        </>
    );
};

export default WorkflowDetailPage;