import { useMessageBox } from "@/components/containers/messagebox-provider";
import { useLanguage } from "@/hooks/use-language";
import type { IField } from "@ldc/autoform";
import { useCallback, useState } from "react";
import type { SocketEvent, SocketEventFullPayload } from "../types/socket-event";
import { useGetNodeDataInfo } from "./apis/node-data";

export enum InteractionModalEnum {
    WORKFLOW_EXECUTION = "workflow_execution",
    INPUT_REQUESTED = "input.requested",
    HUMAN_ACTION_REQUESTED = "human_action.requested",
    DATA_EDIT_REQUESTED = "data_edit.requested",
    APPROVAL_FLOW_VIEWER = "approval_flow.viewer"
}

export type IRequestedPayload =
    | (SocketEventFullPayload<SocketEvent.InputRequested> & { type: InteractionModalEnum.INPUT_REQUESTED })
    | (SocketEventFullPayload<SocketEvent.HumanActionRequested> & { type: InteractionModalEnum.HUMAN_ACTION_REQUESTED })
    | (SocketEventFullPayload<SocketEvent.DataEditRequested> & { type: InteractionModalEnum.DATA_EDIT_REQUESTED })
    | (SocketEventFullPayload<SocketEvent.NodeApprovalFlowResult> & { type: InteractionModalEnum.APPROVAL_FLOW_VIEWER, [key: string]: any })
    | { type: InteractionModalEnum.WORKFLOW_EXECUTION } & { input_schema?: IField[], [key: string]: any };

export type InteractionResultType = Record<string, unknown> | null;

export interface InteractionModalState {
    title?: string;
    payload: IRequestedPayload;
    resolve: (result: InteractionResultType) => void;
}

const InteractionModalType = {
    [InteractionModalEnum.WORKFLOW_EXECUTION]: "workflow_executing",
    [InteractionModalEnum.INPUT_REQUESTED]: "input.requested",
    [InteractionModalEnum.HUMAN_ACTION_REQUESTED]: "human_action.requested",
    [InteractionModalEnum.DATA_EDIT_REQUESTED]: "data_edit.requested",
    [InteractionModalEnum.APPROVAL_FLOW_VIEWER]: "approval_flow.viewer"
} as const;

export function useInteractionModal() {
    const { t } = useLanguage();
    const [modalState, setModalState] = useState<InteractionModalState | null>(
        null
    );

    const { refetch: refetchOutputData } = useGetNodeDataInfo(
        { runId: modalState?.payload?.run_id ?? "", nodeId: modalState?.payload?.node_id ?? "", side: "output" },
        {
            enabled: false,
            staleTime: 0,
        }
    );

    const showMessageBox = useMessageBox();

    const handleAction = useCallback(
        (resolve: (result: InteractionResultType) => void) => (result: InteractionResultType) => {
            resolve(result);
            setModalState(null);
        },
        []
    );

    const prompt = useCallback(
        async (
            payload: IRequestedPayload
        ): Promise<InteractionResultType> => {
            if (payload.type === InteractionModalEnum.HUMAN_ACTION_REQUESTED) {
                setModalState({
                    title: "",
                    payload,
                    resolve: handleAction(() => null),
                });
                const result = await showMessageBox(
                    payload.instruction ?? "",
                    t(InteractionModalType[payload.type]),
                );

                setModalState(null);

                const res = await refetchOutputData();
                const latestETag = res.data?.data?.etag;

                return { isConfirmed: result, eTag: latestETag };
            }
            const title = t(InteractionModalType[payload.type]);
            return new Promise((resolve) => {
                setModalState({
                    title,
                    payload,
                    resolve: handleAction(resolve)
                });
            });
        },
        [showMessageBox]
    );

    const dismiss = useCallback((nodeId: string) => {
        setModalState((current) => {
            if (current?.payload.node_id === nodeId) {
                current.resolve(null);
                return null;
            }
            return current;
        });
    }, []);

    return { modalState, prompt, dismiss };
}
