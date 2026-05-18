
import { useLanguage } from "@/hooks/use-language";
import { isAxiosError } from "@ldc/api-sdk";
import { toast } from "@ldc/ui/blocks/toast/toast";
import { useCallback, useRef, useState } from "react";
import type { IAIAssistantMessage } from "../types";
import { useCreateWorkflowWithAI } from "./apis/execute";

interface UseExecuteAIAssistantReturn {
    messages: IAIAssistantMessage[];
    isRunning: boolean;
    sendMessage: (text: string) => Promise<void>;
}

export const useExecuteAIAssistant = (): UseExecuteAIAssistantReturn => {
    const { t } = useLanguage();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<IAIAssistantMessage[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const isRunningRef = useRef(false);

    const { mutateAsync } = useCreateWorkflowWithAI();

    const appendMessage = useCallback((message: IAIAssistantMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    const removeMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isRunningRef.current) return;

            const userMessage: IAIAssistantMessage = {
                id: `user_${Date.now()}`,
                role: "user",
                content: text,
                createdAt: Date.now(),
            };
            appendMessage(userMessage);

            const thinkingMessageId = `thinking_${Date.now()}`;
            const thinkingMessage: IAIAssistantMessage = {
                id: thinkingMessageId,
                role: "assistant",
                content: "",
                isThinking: true,
                createdAt: Date.now(),
            };
            appendMessage(thinkingMessage);

            setIsRunning(true);
            isRunningRef.current = true;

            try {
                const response = await mutateAsync({
                    message: text,
                    ...(conversationId && { conv_id: conversationId }),
                });

                if (!conversationId && response.agent_data?.conv_id) {
                    setConversationId(response.agent_data.conv_id);
                }

                removeMessage(thinkingMessageId);

                const workflowId = response.agent_data?.workflow_id;
                const isWorkflowReady =
                    response.status === "workflow_ready" ||
                    response.agent_data?.status === "workflow_ready";

                const assistantMessage: IAIAssistantMessage = {
                    id: `assistant_${Date.now()}`,
                    role: "assistant",
                    content:
                        response.agent_data?.content || response.message ||
                        t("notification.workflow_created_successfully_with_ai"),
                    workflowId:
                        workflowId && isWorkflowReady
                            ? workflowId
                            : undefined,
                    createdAt: Date.now(),
                };
                appendMessage(assistantMessage);

                if (workflowId && isWorkflowReady) {
                    toast.success(
                        t("notification.success"),
                        t("notification.workflow_created_successfully_with_ai"),
                    );
                }
            } catch (error) {
                removeMessage(thinkingMessageId);

                const errMsg = isAxiosError(error)
                    ? (error.response?.data as { message?: string })?.message ?? error.message
                    : error instanceof Error
                        ? error.message
                        : t("notification.workflow_creation_failed");

                appendMessage({
                    id: `error_${Date.now()}`,
                    role: "assistant",
                    content: `${t("notification.workflow_creation_failed")}: ${errMsg}`,
                    createdAt: Date.now(),
                });

                toast.error(
                    t("notification.error"),
                    errMsg,
                );
            } finally {
                setIsRunning(false);
                isRunningRef.current = false;
            }
        },
        [mutateAsync, appendMessage, removeMessage, t, conversationId],
    );

    return { messages, isRunning, sendMessage };
};