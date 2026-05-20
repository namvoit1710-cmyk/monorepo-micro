import { useCallback, useRef } from "react";
import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage } from "../types/message";
import type { ChatTransport, ChatTransportEvent, TransportContext } from "./transport/types";
import type { ChatStoreAdapter } from "./store/types";
import {
  appendMessageToChatMessage,
  createStreamingAssistantMessage,
  updateAssistantMessageFromEvent,
  markMessageComplete,
  markMessageError,
} from "../helpers/message-helpers";

export interface ChatActionsConfig {
  beforeSend?: (messages: ChatMessage[]) => Promise<TransportContext>;
}

export interface ChatActions {
  onNew: (message: AppendMessage) => Promise<void>;
  onCancel?: () => Promise<void>;
}

export function useChatActions(
  transport: ChatTransport,
  store: ChatStoreAdapter,
  config?: ChatActionsConfig,
): ChatActions {
  const transportRef = useRef(transport);
  transportRef.current = transport;

  const storeRef = useRef(store);
  storeRef.current = store;

  const configRef = useRef(config);
  configRef.current = config;

  const onNew = useCallback(async (message: AppendMessage) => {
    const s = storeRef.current;

    const userMsg = appendMessageToChatMessage(message);
    s.setMessages((prev) => [...prev, userMsg]);
    s.setIsRunning(true);

    const assistantMsg = createStreamingAssistantMessage();
    s.setMessages((prev) => [...prev, assistantMsg]);

    const snapshot = [...s.messages, userMsg];

    let context: TransportContext | undefined;
    if (configRef.current?.beforeSend) {
      context = await configRef.current.beforeSend(snapshot);
    }

    transportRef.current.send(
      snapshot,
      {
        onChunk: (event: ChatTransportEvent) => {
          storeRef.current.setMessages((prev) =>
            updateAssistantMessageFromEvent(prev, assistantMsg.id, event),
          );
        },
        onComplete: () => {
          storeRef.current.setMessages((prev) =>
            markMessageComplete(prev, assistantMsg.id),
          );
          storeRef.current.setIsRunning(false);
        },
        onError: (error) => {
          storeRef.current.setMessages((prev) =>
            markMessageError(prev, assistantMsg.id, error.message),
          );
          storeRef.current.setIsRunning(false);
        },
      },
      { context },
    );
  }, []);

  const onCancel = useCallback(async () => {
    transportRef.current.cancel?.();
    storeRef.current.setIsRunning(false);
  }, []);

  return {
    onNew,
    onCancel: transport.cancel ? onCancel : undefined,
  };
}
