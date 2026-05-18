import type { ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import type { ChatTransport, TransportContext } from "../runtime/transport/types";
import type { ChatStoreAdapter } from "../runtime/store/types";
import type { ChatMessage } from "../types/message";
import { useDefaultChatStore } from "../runtime/store/use-default-chat-store";
import { useChatActions } from "../runtime/use-chat-actions";
import { useChatRuntime } from "../runtime/use-chat-runtime";

export interface ChatRuntimeProviderProps {
  transport: ChatTransport;
  children: ReactNode;
  store?: ChatStoreAdapter;
  beforeSend?: (messages: ChatMessage[]) => Promise<TransportContext>;
  convertMessage?: (message: ChatMessage) => ThreadMessageLike;
  joinStrategy?: "concat-content" | "none";
}

export function ChatRuntimeProvider({
  transport,
  children,
  store: externalStore,
  beforeSend,
  convertMessage,
  joinStrategy,
}: ChatRuntimeProviderProps) {
  const defaultStore = useDefaultChatStore();
  const store = externalStore ?? defaultStore;
  const actions = useChatActions(transport, store, { beforeSend });
  const runtime = useChatRuntime(store, actions, { convertMessage, joinStrategy });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
