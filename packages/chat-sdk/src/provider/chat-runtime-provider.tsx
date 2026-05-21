import type { ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import type {
  ChatTransport,
  TransportContext,
} from "../runtime/transport/types";
import type { ChatStoreAdapter } from "../runtime/store/types";
import type { ChatMessage } from "../types/message";
import type { ChatThreadListAdapter } from "../runtime/use-chat-runtime";
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
  onUpload?: (
    file: File,
  ) => Promise<{ id: string; url: string; contentType?: string }>;
  threadList?: ChatThreadListAdapter;
}

export function ChatRuntimeProvider({
  transport,
  children,
  store: externalStore,
  beforeSend,
  convertMessage,
  joinStrategy,
  onUpload,
  threadList,
}: ChatRuntimeProviderProps) {
  // Always call useDefaultChatStore unconditionally (React hook rules)
  const defaultStore = useDefaultChatStore();
  const store = externalStore ?? defaultStore;
  const actions = useChatActions(transport, store, { beforeSend });
  const runtime = useChatRuntime(store, actions, {
    convertMessage,
    joinStrategy,
    onUpload,
    threadList,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
