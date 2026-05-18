import { useLanguage } from "@/hooks/use-language";
import {
    MessagePrimitive,
    useAuiState
} from "@assistant-ui/react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { useAIAssistantContext } from "../context/assistant-context";
import { MarkdownText } from "./markdown-text";

export const AssistantMessage: FC = () => {
    const { t } = useLanguage();
    const messageId = useAuiState((s) => s.message.id);
    const { getMessageById } = useAIAssistantContext();

    const internalMessage = getMessageById(messageId);
    const workflowId = internalMessage?.workflowId;
    const isThinking = internalMessage?.isThinking;

    if (isThinking) {
        return (
            <MessagePrimitive.Root
                className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
                data-role="assistant"
            >
                <div className="aui-assistant-message-content px-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <span className="inline-block size-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                            <span className="inline-block size-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                            <span className="inline-block size-2 rounded-full bg-current animate-bounce" />
                        </div>
                        <span className="text-sm">
                            {t("ai_assistant_thinking") || "Thinking..."}
                        </span>
                    </div>
                </div>
            </MessagePrimitive.Root>
        );
    }

    return (
        <MessagePrimitive.Root
            className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
            data-role="assistant"
        >
            <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
                <MessagePrimitive.Parts>
                    {({ part }) => {
                        if (part.type === "text") return <MarkdownText />;
                        return null;
                    }}
                </MessagePrimitive.Parts>

                {workflowId && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <Link
                            to={`/workflow/${workflowId}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
                        >
                            {t("view_workflow") || "View Workflow"} →
                        </Link>
                    </div>
                )}
            </div>

            {/* <div className="aui-assistant-message-footer mt-1 ml-2 flex min-h-6 items-center">
                <AssistantActionBar />
            </div> */}
        </MessagePrimitive.Root>
    );
};

// const AssistantActionBar: FC = () => {
//     return (
//         <ActionBarPrimitive.Root
//             hideWhenRunning
//             autohide="not-last"
//             className="aui-assistant-action-bar-root -ml-1 flex gap-1 text-muted-foreground"
//         >
//             <ActionBarPrimitive.Copy asChild>
//                 <TooltipIconButton tooltip="Copy">
//                     <MessagePrimitive.If copied>
//                         <CheckIcon />
//                     </MessagePrimitive.If>
//                     <MessagePrimitive.If copied={false}>
//                         <CopyIcon />
//                     </MessagePrimitive.If>
//                 </TooltipIconButton>
//             </ActionBarPrimitive.Copy>
//             <ActionBarPrimitive.Reload asChild>
//                 <TooltipIconButton tooltip="Retry">
//                     <RefreshCwIcon />
//                 </TooltipIconButton>
//             </ActionBarPrimitive.Reload>
//         </ActionBarPrimitive.Root>
//     );
// };