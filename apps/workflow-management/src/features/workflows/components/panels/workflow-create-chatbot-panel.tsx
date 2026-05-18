// =============================================================================
// AI Assistant Feature — Main Panel Component
// =============================================================================
//
// Entry point duy nhất cho UI. Compose:
// 1. useAIAssistantRuntime  → wires external store runtime
// 2. AIAssistantProvider    → provides internal messages cho child lookup
// 3. AssistantRuntimeProvider → assistant-ui context
// 4. AIAssistantThread      → customized thread UI
//
// Pattern tương tự WorkflowDetailPage: shell component chỉ compose,
// không chứa business logic.
// =============================================================================

import { AIAssistantThread } from "@/features/ai-assistant/components/thread";
import { AIAssistantProvider } from "@/features/ai-assistant/context/assistant-context";
import { useAIAssistantRuntime } from "@/features/ai-assistant/hooks/use-ai-asssistant-runtime";
import { useLanguage } from "@/hooks/use-language";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Button } from "@ldc/ui/components/button";
import { XIcon } from "lucide-react";

interface WorkflowCreateChatbotPanelProps {
    onClose?: () => void;
}

const WorkflowCreateChatbotPanel = ({
    onClose,
}: WorkflowCreateChatbotPanelProps) => {
    const { t } = useLanguage();
    const { runtime, messages } = useAIAssistantRuntime();

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            <AIAssistantProvider messages={messages}>
                <div className="h-full w-full overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
                        <h3 className="text-lg font-semibold">
                            {t("create_with_ai") || "Create with AI"}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    <AIAssistantThread />
                </div>
            </AIAssistantProvider>
        </AssistantRuntimeProvider>
    );
};

export default WorkflowCreateChatbotPanel;