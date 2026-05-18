import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage } from "../types/message";
import type { ChatTransportEvent } from "../runtime/transport/types";

let counter = 0;
function generateId(): string {
  return `msg_${Date.now()}_${++counter}`;
}

export function appendMessageToChatMessage(message: AppendMessage): ChatMessage {
  const text = message.content
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text)
    .join("");

  return {
    id: generateId(),
    role: "user",
    content: text,
    createdAt: new Date(),
    status: "complete",
  };
}

export function createStreamingAssistantMessage(): ChatMessage {
  return {
    id: generateId(),
    role: "assistant",
    content: "",
    createdAt: new Date(),
    status: "streaming",
  };
}

export function updateAssistantMessageFromEvent(
  messages: ChatMessage[],
  assistantId: string,
  event: ChatTransportEvent,
): ChatMessage[] {
  return messages.map((msg) => {
    if (msg.id !== assistantId) return msg;

    switch (event.type) {
      case "text-delta": {
        const currentText = typeof msg.content === "string" ? msg.content : "";
        return { ...msg, content: currentText + event.textDelta };
      }
      case "metadata":
        return { ...msg, metadata: { ...msg.metadata, ...event.data } };
      default:
        return msg;
    }
  });
}

export function markMessageComplete(
  messages: ChatMessage[],
  messageId: string,
): ChatMessage[] {
  return messages.map((msg) =>
    msg.id === messageId ? { ...msg, status: "complete" as const } : msg,
  );
}

export function markMessageError(
  messages: ChatMessage[],
  messageId: string,
  error: string,
): ChatMessage[] {
  return messages.map((msg) =>
    msg.id === messageId
      ? { ...msg, status: "error" as const, metadata: { ...msg.metadata, error } }
      : msg,
  );
}
