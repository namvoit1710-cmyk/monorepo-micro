import { useMemo } from "react";
import { ChatRuntimeProvider, SocketTransport, Thread } from "@ldc/chat-sdk";
import { env } from "@/env";

export default function ChatPage() {
  const transport = useMemo(() => {
    return new SocketTransport({
      baseUrl: env.PUBLIC_WORKFLOW_API_URL || "http://localhost:3000",
      room: (context) => `chat-room-${context.runId}`,
    });
  }, []);

  return (
    <ChatRuntimeProvider transport={transport}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="flex h-14 items-center border-b px-6 bg-muted/20">
          <h2 className="font-semibold text-lg text-primary">AI Assistant</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <Thread />
        </div>
      </div>
    </ChatRuntimeProvider>
  );
}
