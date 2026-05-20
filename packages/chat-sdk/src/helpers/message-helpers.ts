import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage, ChatContentPart } from "../types/message";
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

  const attachments = message.attachments
    ?.filter((a) => a.status.type === "complete")
    .map((a) => ({
      id: a.id,
      name: a.name,
      contentType: a.contentType,
      type: a.type as "image" | "document" | "file" | undefined,
      url: (a as unknown as { url?: string }).url,
    }));

  return {
    id: generateId(),
    role: "user",
    content: text,
    createdAt: new Date(),
    status: "complete",
    attachments: attachments?.length ? attachments : undefined,
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
        if (Array.isArray(msg.content)) {
          const parts = msg.content as ChatContentPart[];
          const lastPart = parts[parts.length - 1];
          if (lastPart?.type === "text") {
            return {
              ...msg,
              content: [
                ...parts.slice(0, -1),
                { type: "text" as const, text: lastPart.text + event.textDelta },
              ] as ChatContentPart[],
            };
          }
          return {
            ...msg,
            content: [...parts, { type: "text" as const, text: event.textDelta }] as ChatContentPart[],
          };
        }
        const currentText = typeof msg.content === "string" ? msg.content : "";
        return { ...msg, content: currentText + event.textDelta };
      }
      case "reasoning": {
        const parts = Array.isArray(msg.content) ? msg.content : [];
        const lastPart = parts[parts.length - 1];
        if (lastPart?.type === "reasoning") {
          return {
            ...msg,
            content: [
              ...parts.slice(0, -1),
              { type: "reasoning" as const, steps: [...lastPart.steps, event.step] },
            ],
          };
        }
        return {
          ...msg,
          content: [...parts, { type: "reasoning" as const, steps: [event.step] }],
        };
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
