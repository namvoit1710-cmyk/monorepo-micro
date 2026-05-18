import { useMessageBox } from "@/components/containers/messagebox-provider";
import { useLanguage } from "@/hooks/use-language";
import { useLatestRef } from "@/hooks/use-last-ref";
import { pushGatewaySocket } from "@/lib/socket";
import { useQueryClient } from "@ldc/tanstack-query";
import { toast } from "@ldc/ui/blocks/toast/toast";
import type { WorkflowEditorHandle } from "@ldc/workflow-editor";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { workflowInputData } from "../config/workflow-input-data";
import { useEditorStore } from "../stores/editor-stores";
import type { SocketEventFullPayload } from "../types/socket-event";
import { SocketEvent } from "../types/socket-event";
import type { INodeLogData, IWorkflowLogData } from "../types/workflow-log";
import { createConfirmRejectPayload } from "../utils/buil-submit-operation";
import { usePatchNodeData, useResumeTask, useRunNode, useRunWorkflow, useStopWorkflow, useSubmitNodeData, workflowKey } from "./apis/workflows";
import type {
    InteractionResultType,
    IRequestedPayload
} from "./use-interaction-modal";
import {
    InteractionModalEnum
} from "./use-interaction-modal";

interface IUseExecuteWorkflowProps {
    dismiss?: (nodeId: string) => void;
    prompt: (payload: IRequestedPayload) => Promise<InteractionResultType | boolean>;
    editorRef: RefObject<WorkflowEditorHandle | null>;
    onSaveWorkflow?: () => void;
    onNodeCompleted?: (data: INodeLogData) => void;
    onNodeFailed?: (data: INodeLogData) => void;
    onWorkflowCompleted?: (data: IWorkflowLogData) => void;
    onWorkflowFailed?: (data: IWorkflowLogData) => void;
}

const useExecuteWorkflow = ({
    prompt,
    dismiss,
    editorRef,
    onSaveWorkflow,
    onNodeCompleted,
    onNodeFailed,
    onWorkflowCompleted,
    onWorkflowFailed
}: IUseExecuteWorkflowProps) => {
    const { t } = useLanguage();

    const localExecution = useEditorStore((s) => s.localExecution);
    const setLocalExecution = useEditorStore((s) => s.setLocalExecution);
    const setNodeExecution = useEditorStore((s) => s.setNodeExecution);

    const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);

    const workflowInfo = useEditorStore((s) => s.workflowInfo);
    const workflowId = workflowInfo?.id;
    const testRunId = workflowInfo?.test_run_id;

    const runToastIdRef = useRef<string | number | null>(null);

    const workflowStartTimeRef = useRef<number | null>(null);

    const getNodeName = useCallback((nodeId: string): string | undefined => {
        const foundNode = useEditorStore
            .getState()
            .workflowData.nodes.find((n) => n.id === nodeId);
        return foundNode?.data?.title ?? foundNode?.data?.name;
    }, []);

    const resetRunToast = useCallback(() => {
        if (runToastIdRef.current) {
            setIsWorkflowRunning(false);
            toast.dismiss(runToastIdRef.current);
            runToastIdRef.current = null;
        }
    }, []);

    const dismissRunToast = useCallback((type: "success" | "error") => {
        resetRunToast();

        if (type === "success") {
            toast.success(
                t("notification.success"),
                t("notification.workflow_completed_successfully")
            );
        } else {
            toast.error(
                t("notification.error"),
                t("notification.workflow_execution_failed")
            );
        }
    }, []);

    const latestRef = useLatestRef({
        testRunId,
        workflowId,
        prompt,
        dismiss,

        localExecution,
        setLocalExecution,

        onSaveWorkflow,
        onNodeCompleted,
        onNodeFailed,
        onWorkflowCompleted,
        onWorkflowFailed
    });

    const {
        mutate: runNode,
        isPending: isRunNodeLoading,
        variables: runNodeVariables
    } = useRunNode({
        onError: (_, { nodeId }) => {
            latestRef.current.onNodeFailed?.({
                nodeId: nodeId,
                nodeName: getNodeName(nodeId),
                timestamp: Date.now()
            });
            resetRunToast();
        }
    });
    const onRunNode = useCallback(
        (nodeId: string) => {
            editorRef.current?.updateNodeConnectionStatus?.(nodeId, "idle");

            const workflowId = latestRef.current.workflowId;
            if (!workflowId) return;

            latestRef.current.onSaveWorkflow?.();
            setLocalExecution({ type: "node", nodeId });
            runNode({ workflowId, nodeId });
        },
        [runNode, setLocalExecution]
    );

    const queryClient = useQueryClient();
    const { mutate: stopWorkflow } = useStopWorkflow({
        onSuccess: () => {
            resetRunToast();
            editorRef.current?.resetAllNodeStatus?.();
        }
    });

    const handleStopWorkflow = useCallback(() => {
        const testRunId = latestRef.current.testRunId;
        if (!testRunId) return;
        stopWorkflow(testRunId);
    }, [testRunId]);

    const { mutate: runWorkflow, isPending: isRunWorkflowLoading } =
        useRunWorkflow({
            onSuccess: () => {
                if (!testRunId) {
                    void queryClient.invalidateQueries({
                        queryKey: workflowKey.getWorkflowById(workflowId)
                    });
                }
            },
            onError: () => {
                latestRef.current.onWorkflowFailed?.({ timestamp: Date.now() });
                resetRunToast();
            }
        });

    const onRunWorkflow = useCallback(async () => {
        editorRef.current?.resetAllNodeStatus?.();

        const formValue = await latestRef.current.prompt({
            type: InteractionModalEnum.WORKFLOW_EXECUTION,
            input_schema: workflowInputData
        });

        let inputDataObj: Record<string, any> = {};
        try {
            if (!formValue) return;

            const inputData = (formValue as Record<"input_data", string>).input_data as string | undefined;

            if (!inputData) return

            if (typeof inputData === "string") {
                inputDataObj = JSON.parse(inputData);
            }
        } catch (error) {
            inputDataObj = {};
        }

        setLocalExecution({ type: "workflow", runId: testRunId });
        setIsWorkflowRunning(true);
        resetRunToast();

        if (!runToastIdRef.current) {
            runToastIdRef.current = toast.loading(
                t("notification.loading"),
                t("notification.workflow_executing")
            );
        }
        // latestRef.current.onSaveWorkflow?.();
        workflowStartTimeRef.current = Date.now();
        runWorkflow({ workflowId, config: { input_data: inputDataObj } });
        return;
    }, [workflowId]);

    const { mutateAsync: submitInteractionResult } = useSubmitNodeData();
    const { mutateAsync: patchInteractionResult } = usePatchNodeData();

    const { mutate: rerunTask } = useResumeTask();

    const showMessageBox = useMessageBox();

    useEffect(() => {
        if (!testRunId) return;

        const reRunNode = async ({ nodeId, runId, taskId, payload }: {
            nodeId: string;
            runId: string;
            taskId: string;
            payload: Record<string, any>;
        }) => {

            try {
                const { eTag, ...rest } = payload ?? {};

                await patchInteractionResult({
                    node_id: nodeId,
                    run_id: runId,
                    task_id: taskId,
                    etag: eTag,
                    data: rest
                })

            } catch (error) {
                //
            }

            await submitInteractionResult({
                runId,
                nodeId,
                taskId,
            })
        }

        const socket = pushGatewaySocket.connect("");

        if (socket.connected) {
            socket.emit("wait", { key: `run:${testRunId}` });
        }

        const handleConnect = () => {
            socket.emit("wait", { key: `run:${testRunId}` });
        }

        const handleReconnectFailed = async () => {
            const result = await showMessageBox(t("the_system_disconnected_please_reload_to_connect_again"), t("disconnected_server_warning"))

            if (result) {
                window.location.reload();
            }
        }
        socket.on("connect", handleConnect)
        socket.on("reconnect", handleConnect);
        socket.on("reconnect_failed", handleReconnectFailed)

        const onRunStarted = () => {
            if (!latestRef.current.localExecution) return;

            runToastIdRef.current ??= toast.loading(
                t("notification.loading"),
                t("notification.workflow_executing")
            );
            workflowStartTimeRef.current = Date.now();
        };

        const onRunCompleted = (payload: SocketEventFullPayload<SocketEvent.RunCompleted>) => {
            if (!latestRef.current.localExecution) return;

            workflowStartTimeRef.current = null;
            const timestamp = new Date(payload.timestamp).getTime();
            latestRef.current.onWorkflowCompleted?.({ timestamp });

            if (latestRef.current.localExecution?.type === "workflow" && latestRef.current.localExecution.runId === payload.run_id) {
                setLocalExecution(null);
                dismissRunToast("success");
                editorRef.current?.zoomToFit?.();
            }

        };

        const onRunFailed = (payload: SocketEventFullPayload<SocketEvent.RunFailed>) => {
            if (!latestRef.current.localExecution) return;

            workflowStartTimeRef.current = null;
            const timestamp = new Date(payload.timestamp).getTime();
            latestRef.current.onWorkflowFailed?.({ timestamp, errorMessage: payload.error });

            if (latestRef.current.localExecution?.type === "workflow" && latestRef.current.localExecution.runId === payload.run_id) {
                setLocalExecution(null);
                dismissRunToast("error");
            }
        };

        const onRunChildRunStarted = async (payload: SocketEventFullPayload<SocketEvent.ChildRunStarted>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.parent_node_id, {
                status: "executing",
                cacheKey: payload.parent_node_id,
                timestamp: new Date(payload.timestamp).getTime()
            });

            if (!editorRef.current?.isNodeInViewport?.(payload.parent_node_id)) {
                await editorRef.current?.centerOnNode?.(payload.parent_node_id);
            }

            editorRef.current?.setNodeStatus?.(payload.parent_node_id, "executing");
        };

        const onRunChildRunCompleted = (payload: SocketEventFullPayload<SocketEvent.ChildRunCompleted>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.parent_node_id, {
                status: "completed",
                cacheKey: "",
                timestamp: new Date(payload.timestamp).getTime()
            });

            editorRef.current?.setNodeStatus?.(payload.parent_node_id, "completed");
        }

        const onTaskDispatched = async (payload: SocketEventFullPayload<SocketEvent.TaskDispatched>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.node_id, {
                status: "executing",
                cacheKey: payload.idempotency_key,
                timestamp: new Date(payload.timestamp).getTime()
            });

            if (latestRef.current.localExecution?.type === "workflow" && !!editorRef.current?.getZoomLevel?.() && editorRef.current.getZoomLevel() < 1) {
                await editorRef.current?.zoomByLevel?.(1);
            }

            if (!editorRef.current?.isNodeInViewport?.(payload.node_id)) {
                await editorRef.current?.centerOnNode?.(payload.node_id);
            }

            editorRef.current?.setNodeStatus?.(payload.node_id, "executing");
        };

        const onTaskCompleted = (payload: SocketEventFullPayload<SocketEvent.TaskCompleted>) => {
            if (!latestRef.current.localExecution) return;

            const timestamp = new Date(payload.timestamp).getTime();

            latestRef.current.dismiss?.(payload.node_id);

            setNodeExecution(payload.node_id, {
                status: "completed",
                runId: payload.run_id,
                cacheKey: "",
                timestamp,
                output: undefined,
                hasLargeOutput: false
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "completed");
            latestRef.current.onNodeCompleted?.({
                nodeId: payload.node_id,
                nodeName: getNodeName(payload.node_id),
                timestamp
            });

            if (latestRef.current.localExecution?.type === "node" && latestRef.current.localExecution.nodeId === payload.node_id) {
                setLocalExecution(null);
            }

            if (!runToastIdRef.current) {
                toast.success(
                    t("notification.success"),
                    t("notification.node_completed_successfully")
                );
            }
        };

        const onTaskFailed = (payload: SocketEventFullPayload<SocketEvent.TaskFailed>) => {
            if (!latestRef.current.localExecution) return;

            const timestamp = new Date(payload.timestamp).getTime();

            latestRef.current.dismiss?.(payload.node_id);

            setNodeExecution(payload.node_id, {
                status: "failed",
                runId: payload.run_id,
                cacheKey: "",
                timestamp,
                output: undefined,
                hasLargeOutput: false
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "failed");

            latestRef.current.onNodeFailed?.({
                nodeId: payload.node_id,
                nodeName: getNodeName(payload.node_id),
                timestamp,
                errorMessage: payload.error_message
            });

            if (latestRef.current.localExecution?.type === "node" && latestRef.current.localExecution.nodeId === payload.node_id) {
                setLocalExecution(null);
            }

            if (!runToastIdRef.current) {
                toast.error(
                    t("notification.error"),
                    t("notification.node_execution_failed")
                );
            }
        };

        const onTaskRetrying = (payload: SocketEventFullPayload<SocketEvent.TaskRetrying>) => {
            if (!latestRef.current.localExecution) return;

            const nextRetryTime = payload.next_retry_at
                ? new Date(payload.next_retry_at).toLocaleTimeString()
                : "soon";
            toast.info(
                t("notification.info"),
                `Task retrying (attempt ${payload.attempt}). Next retry at ${nextRetryTime}`
            );
        };

        const onInputRequested = async (payload: SocketEventFullPayload<SocketEvent.InputRequested>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.node_id, {
                status: "executing",
                timestamp: new Date(payload.timestamp).getTime()
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "executing");

            const result = await latestRef.current.prompt({
                type: InteractionModalEnum.INPUT_REQUESTED,
                ...payload
            });

            // rerunTask({
            //     runId: payload.run_id,
            //     taskId: payload.task_id,
            //     payload: {
            //         updated_input: result ? result as Record<string, any> : {}
            //     }
            // });
            void reRunNode({
                nodeId: payload.node_id,
                runId: payload.run_id,
                taskId: payload.task_id,
                payload: result ? result as Record<string, any> : createConfirmRejectPayload("reject")
            })
        };

        const onHumanActionRequested = async (
            payload: SocketEventFullPayload<SocketEvent.HumanActionRequested>
        ) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.node_id, {
                status: "executing",
                timestamp: new Date(payload.timestamp).getTime()
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "executing");

            const result = await latestRef.current.prompt({
                type: InteractionModalEnum.HUMAN_ACTION_REQUESTED,
                ...payload
            });

            // rerunTask({
            //     runId: payload.run_id,
            //     taskId: payload.task_id,
            //     payload: {
            //         updated_input: result ? {
            //             confirm: result
            //         } : {
            //             reject: true
            //         }
            //     }
            // });
            void reRunNode({
                nodeId: payload.node_id,
                runId: payload.run_id,
                taskId: payload.task_id,
                payload: result ? createConfirmRejectPayload("confirm") : createConfirmRejectPayload("reject")
            })
        };

        const onDataEditRequested = async (payload: SocketEventFullPayload<SocketEvent.DataEditRequested>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.node_id, {
                status: "executing",
                timestamp: new Date(payload.timestamp).getTime()
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "executing");

            const result = await latestRef.current.prompt({
                type: InteractionModalEnum.DATA_EDIT_REQUESTED,
                ...payload
            });

            // rerunTask({
            //     runId: payload.run_id,
            //     taskId: payload.task_id,
            //     payload: {
            //         updated_input: result ? result as Record<string, any> : {}
            //     }
            // });
            void reRunNode({
                nodeId: payload.node_id,
                runId: payload.run_id,
                taskId: payload.task_id,
                payload: result ? result as Record<string, any> : createConfirmRejectPayload("reject")
            })
        };

        const onConditionEvaluated = (payload: SocketEventFullPayload<SocketEvent.ConditionEvaluated>) => {
            if (!latestRef.current.localExecution) return;

            setNodeExecution(payload.node_id, {
                status: "completed",
                runId: payload.run_id,
                cacheKey: "",
                timestamp: new Date(payload.timestamp).getTime(),
                output: undefined,
                hasLargeOutput: false
            });

            editorRef.current?.setNodeStatus?.(payload.node_id, "completed");
        };

        const onEdgeTraversed = (payload: SocketEventFullPayload<SocketEvent.EdgeTraversed>) => {
            if (!latestRef.current.localExecution) return;

            editorRef.current?.setConnectionStatusBySourcePort?.(payload.source_node_id, payload.source_port_id, "completed");
        };

        const onNodeApprovalFlowResult = async (payload: SocketEventFullPayload<SocketEvent.NodeApprovalFlowResult>) => {
            try {
                editorRef.current?.setNodeStatus?.(payload.node_id, "completed");

                await latestRef.current.prompt({
                    type: InteractionModalEnum.APPROVAL_FLOW_VIEWER,
                    ...payload
                });

            } catch (error) {
                toast.error(
                    t("notification.error"),
                    t("notification.approval_flow_failed_to_load")
                );
            }
        };

        const methodByEvent = {
            [SocketEvent.RunStarted]: onRunStarted,
            [SocketEvent.RunCompleted]: onRunCompleted,
            [SocketEvent.RunFailed]: onRunFailed,
            [SocketEvent.ChildRunStarted]: onRunChildRunStarted,
            [SocketEvent.ChildRunCompleted]: onRunChildRunCompleted,
            [SocketEvent.TaskDispatched]: onTaskDispatched,
            [SocketEvent.TaskCompleted]: onTaskCompleted,
            [SocketEvent.TaskFailed]: onTaskFailed,
            [SocketEvent.TaskRetrying]: onTaskRetrying,
            [SocketEvent.ConditionEvaluated]: onConditionEvaluated,
            [SocketEvent.EdgeTraversed]: onEdgeTraversed,

            [SocketEvent.InputRequested]: onInputRequested,
            [SocketEvent.HumanActionRequested]: onHumanActionRequested,
            [SocketEvent.DataEditRequested]: onDataEditRequested,
            [SocketEvent.NodeApprovalFlowResult]: onNodeApprovalFlowResult
        }

        const handleDataChunk = async (socketMessage: unknown) => {
            let nestedData: any;
            try {
                const eventData = typeof socketMessage === "string" ? JSON.parse(socketMessage) : socketMessage;
                const innerData = typeof eventData?.data === "string"
                    ? JSON.parse(eventData.data)
                    : (eventData?.data || eventData);
                nestedData = innerData;
            } catch {
                return;
            }

            const rawEvent: string =
                nestedData?.data?.event_type || nestedData?.event_type ||
                nestedData?.data?.eventType || nestedData?.eventType ||
                nestedData?._event || nestedData?.event || "";

            const event = rawEvent.replace(/^workflow:/, "");

            const payload = nestedData?.data || nestedData;


            const handler = methodByEvent[event as keyof typeof methodByEvent];
            if (handler) {
                handler(payload);
            }
        }

        socket.on("data_chunk", handleDataChunk);

        return () => {
            socket.emit("leave", { key: `run:${testRunId}` });
            socket.off("connect", handleConnect);
            socket.off("reconnect", handleConnect);
            socket.off("reconnect_failed", handleReconnectFailed);

            socket.off("data_chunk", handleDataChunk);

            pushGatewaySocket.disconnect();
        };
    }, [testRunId]);

    useEffect(() => {
        return () => {
            editorRef.current?.resetAllNodeStatus?.();
            resetRunToast();
        }
    }, []);

    return {
        onRunNode,
        onRunWorkflow,
        stopWorkflow: handleStopWorkflow,

        isRunNodeLoading,
        loadingNodeId: isRunNodeLoading ? runNodeVariables?.nodeId : null,
        isPrepareWorkflowExecuting: isRunWorkflowLoading,
        isRunWorkflowExecuting: isWorkflowRunning
    };
};

export default useExecuteWorkflow;
