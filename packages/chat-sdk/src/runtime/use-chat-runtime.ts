import {
  useExternalStoreRuntime,
  useExternalMessageConverter,
} from "@assistant-ui/react";
import type { ThreadMessageLike } from "@assistant-ui/react";
import { defaultConvertMessage } from "./message-converter";
import type { ChatStoreAdapter } from "./store/types";
import type { ChatActions } from "./use-chat-actions";
import type { ChatMessage } from "../types/message";

export interface ChatRuntimeConfig {
  convertMessage?: (message: ChatMessage) => ThreadMessageLike;
  joinStrategy?: "concat-content" | "none";
}

export function useChatRuntime(
  store: ChatStoreAdapter,
  actions: ChatActions,
  config?: ChatRuntimeConfig,
) {
  const convertedMessages = useExternalMessageConverter({
    callback: config?.convertMessage ?? defaultConvertMessage,
    messages: store.messages as ChatMessage[],
    isRunning: store.isRunning,
    joinStrategy: config?.joinStrategy ?? "concat-content",
  });

  return useExternalStoreRuntime({
    messages: convertedMessages,
    isRunning: store.isRunning,
    onNew: actions.onNew,
    onCancel: actions.onCancel,
  });
}
