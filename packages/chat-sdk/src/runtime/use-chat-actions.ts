import { useCallback, useRef } from "react";
import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage } from "../types/message";
import type {
  ChatTransport,
  ChatTransportEvent,
  TransportContext,
} from "./transport/types";
import type { ChatStoreAdapter } from "./store/types";
import {
  appendMessageToChatMessage,
  createStreamingAssistantMessage,
  updateAssistantMessageFromEvent,
  markMessageComplete,
  markMessageError,
  editUserMessage,
  removeLastAssistantMessage,
} from "../helpers/message-helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatActionsConfig {
  beforeSend?: (messages: ChatMessage[]) => Promise<TransportContext>;
  /**
   * Called when user edits a message. Receives the truncated message list
   * (everything after the edited message removed). Return TransportContext
   * to trigger a new send, or void to just update the store.
   */
  onEditTransform?: (messages: ChatMessage[]) => Promise<TransportContext | void>;
}

export interface ChatActions {
  onNew: (message: AppendMessage) => Promise<void>;
  onCancel?: () => Promise<void>;
  /** Edit a user message and optionally re-send */
  onEdit?: (message: AppendMessage) => Promise<void>;
  /** Re-send after removing the last errored assistant message */
  onReload?: (parentId: string | null) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Core send logic — shared between onNew, onEdit, onReload
  // -------------------------------------------------------------------------
  const sendToTransport = useCallback(
    async (snapshot: ChatMessage[], assistantMsgId: string) => {
      let context: TransportContext | undefined;
      if (configRef.current?.beforeSend) {
        context = await configRef.current.beforeSend(snapshot);
      }

      transportRef.current.send(
        snapshot,
        {
          onChunk: (event: ChatTransportEvent) => {
            storeRef.current.setMessages((prev) =>
              updateAssistantMessageFromEvent(prev, assistantMsgId, event),
            );
          },
          onComplete: () => {
            storeRef.current.setMessages((prev) =>
              markMessageComplete(prev, assistantMsgId),
            );
            storeRef.current.setIsRunning(false);
          },
          onError: (error) => {
            storeRef.current.setMessages((prev) =>
              markMessageError(prev, assistantMsgId, error.message),
            );
            storeRef.current.setIsRunning(false);
          },
        },
        { context },
      );
    },
    [],
  );

  // -------------------------------------------------------------------------
  // onNew — send a new user message
  // -------------------------------------------------------------------------
  const onNew = useCallback(
    async (message: AppendMessage) => {
      const s = storeRef.current;

      const userMsg = appendMessageToChatMessage(message);
      s.setMessages((prev) => [...prev, userMsg]);
      s.setIsRunning(true);

      const assistantMsg = createStreamingAssistantMessage();
      s.setMessages((prev) => [...prev, assistantMsg]);

      const snapshot = [...s.messages, userMsg];
      await sendToTransport(snapshot, assistantMsg.id);
    },
    [sendToTransport],
  );

  // -------------------------------------------------------------------------
  // onCancel — abort current transport
  // -------------------------------------------------------------------------
  const onCancel = useCallback(async () => {
    transportRef.current.cancel?.();
    storeRef.current.setIsRunning(false);
  }, []);

  // -------------------------------------------------------------------------
  // onEdit — edit a user message and re-send
  // -------------------------------------------------------------------------
  const onEdit = useCallback(
    async (message: AppendMessage) => {
      const s = storeRef.current;

      // Cancel any in-flight request
      transportRef.current.cancel?.();

      // Extract the text from the AppendMessage
      const newText = message.content
        .filter(
          (c): c is { type: "text"; text: string } => c.type === "text",
        )
        .map((c) => c.text)
        .join("");

      // Find the parent message ID — AppendMessage.parentId points to
      // the message being edited in assistant-ui's branching model
      const parentId = message.parentId;

      // Find the user message to edit (the one right after parentId, or the last user msg)
      const messages = [...s.messages] as ChatMessage[];
      let editIdx = -1;
      if (parentId) {
        const parentIdx = messages.findIndex((m) => m.id === parentId);
        // The user message to edit is typically right after the parent
        for (let i = parentIdx + 1; i < messages.length; i++) {
          if (messages[i]?.role === "user") {
            editIdx = i;
            break;
          }
        }
      }
      if (editIdx === -1) {
        // Fallback: find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i]?.role === "user") {
            editIdx = i;
            break;
          }
        }
      }
      if (editIdx === -1) return;

      const truncated = editUserMessage(messages, messages[editIdx]!.id, newText);
      s.setMessages(() => truncated);
      s.setIsRunning(true);

      const assistantMsg = createStreamingAssistantMessage();
      s.setMessages((prev) => [...prev, assistantMsg]);

      await sendToTransport(truncated, assistantMsg.id);
    },
    [sendToTransport],
  );

  // -------------------------------------------------------------------------
  // onReload — re-send after removing last errored assistant message
  // -------------------------------------------------------------------------
  const onReload = useCallback(
    async (_parentId: string | null) => {
      const s = storeRef.current;

      // Cancel any in-flight request
      transportRef.current.cancel?.();

      // Remove the last assistant message (likely errored/cancelled)
      const cleaned = removeLastAssistantMessage([...s.messages] as ChatMessage[]);
      s.setMessages(() => cleaned);
      s.setIsRunning(true);

      const assistantMsg = createStreamingAssistantMessage();
      s.setMessages((prev) => [...prev, assistantMsg]);

      await sendToTransport(cleaned, assistantMsg.id);
    },
    [sendToTransport],
  );

  return {
    onNew,
    onCancel: transport.cancel ? onCancel : undefined,
    onEdit,
    onReload,
  };
}
