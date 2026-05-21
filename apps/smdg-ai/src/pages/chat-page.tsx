import { useOutletContext, useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Thread } from "@ldc/chat-sdk";
import { ShowFormToolRenderer } from "../components/autoform-tool-renderer";
import { WelcomeScreen } from "../components/welcome-screen";

interface ChatOutletContext {
  onSuggestion: (text: string) => void;
}

const THREAD_TOOLS = {
  by_name: { show_form: ShowFormToolRenderer },
} as const;

function ChatErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-destructive">
        Đã xảy ra lỗi khi tải cuộc trò chuyện
      </p>
      <p className="text-xs text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Thử lại
      </button>
    </div>
  );
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const context = useOutletContext<ChatOutletContext | null>();
  if (!context) throw new Error("ChatPage must be rendered inside ChatLayout");
  const { onSuggestion } = context;

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <WelcomeScreen onSuggestion={onSuggestion} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ErrorBoundary FallbackComponent={ChatErrorFallback} resetKeys={[conversationId]}>
        <Thread tools={THREAD_TOOLS} />
      </ErrorBoundary>
    </div>
  );
}
