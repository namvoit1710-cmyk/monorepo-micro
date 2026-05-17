import { useMessageBox } from "@/components/containers/messagebox-provider";
import { useLanguage } from "@/hooks/use-language";
import { IField } from "@ldc/autoform";
import { useCallback, useState } from "react";
import { SocketEvent, SocketEventFullPayload } from "../types/socket-event";

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

    const showMessageBox = useMessageBox();

    const handleAction = useCallback(
        (resolve) => (result: InteractionResultType) => {
            resolve(result);
            setModalState(null);
        },
        []
    );

    const prompt = useCallback(
        async (
            payload: IRequestedPayload
        ): Promise<InteractionResultType | boolean> => {
            if (payload.type === InteractionModalEnum.HUMAN_ACTION_REQUESTED) {
                const result = await showMessageBox(
                    payload.instruction ?? "",
                    t(InteractionModalType[payload.type]),
                );

                return result;
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
