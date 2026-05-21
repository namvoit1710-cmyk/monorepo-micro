import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage, ChatContentPart, ToolCallContentPart } from "../types/message";
import type { ChatTransportEvent } from "../runtime/transport/types";

let counter = 0;
function generateId(): string {
  return `msg_${Date.now()}_${++counter}`;
}

// ---------------------------------------------------------------------------
// Create messages
// ---------------------------------------------------------------------------

export function appendMessageToChatMessage(
  message: AppendMessage,
): ChatMessage {
  const text = message.content
    .filter(
      (c): c is { type: "text"; text: string } => c.type === "text",
    )
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

// ---------------------------------------------------------------------------
// Update assistant message from transport events
// ---------------------------------------------------------------------------

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
            content: [
              ...parts,
              { type: "text" as const, text: event.textDelta },
            ] as ChatContentPart[],
          };
        }
        const currentText =
          typeof msg.content === "string" ? msg.content : "";
        return { ...msg, content: currentText + event.textDelta };
      }

      case "reasoning": {
        const parts = Array.isArray(msg.content)
          ? (msg.content as ChatContentPart[])
          : [];
        const lastPart = parts[parts.length - 1];
        if (lastPart?.type === "reasoning") {
          return {
            ...msg,
            content: [
              ...parts.slice(0, -1),
              {
                type: "reasoning" as const,
                steps: [...lastPart.steps, event.step],
              },
            ],
          };
        }
        return {
          ...msg,
          content: [
            ...parts,
            { type: "reasoning" as const, steps: [event.step] },
          ],
        };
      }

      case "tool-call-start": {
        const parts = Array.isArray(msg.content)
          ? (msg.content as ChatContentPart[])
          : typeof msg.content === "string" && msg.content
            ? ([{ type: "text" as const, text: msg.content }] as ChatContentPart[])
            : [];
        return {
          ...msg,
          content: [
            ...parts,
            {
              type: "tool-call" as const,
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              args: {},
            } satisfies ToolCallContentPart,
          ],
        };
      }

      case "tool-call-delta": {
        if (!Array.isArray(msg.content)) return msg;
        const parts = msg.content as ChatContentPart[];
        const toolIdx = parts.findIndex(
          (p) =>
            p.type === "tool-call" &&
            (p as ToolCallContentPart).toolCallId === event.toolCallId,
        );
        if (toolIdx === -1) return msg;
        const toolPart = parts[toolIdx] as ToolCallContentPart;
        const currentArgs =
          typeof toolPart.args === "string"
            ? toolPart.args
            : JSON.stringify(toolPart.args);
        const newParts = [...parts];
        newParts[toolIdx] = {
          ...toolPart,
          args: tryParseArgs(currentArgs + event.argsDelta),
        };
        return { ...msg, content: newParts };
      }

      case "tool-call-end": {
        if (!Array.isArray(msg.content)) return msg;
        const parts = msg.content as ChatContentPart[];
        const toolIdx = parts.findIndex(
          (p) =>
            p.type === "tool-call" &&
            (p as ToolCallContentPart).toolCallId === event.toolCallId,
        );
        if (toolIdx === -1) return msg;
        const toolPart = parts[toolIdx] as ToolCallContentPart;
        const newParts = [...parts];
        newParts[toolIdx] = { ...toolPart, result: event.result };
        return { ...msg, content: newParts };
      }

      case "metadata":
        return { ...msg, metadata: { ...msg.metadata, ...event.data } };

      case "custom":
        // Store custom events in metadata under a namespaced key
        return {
          ...msg,
          metadata: {
            ...msg.metadata,
            [`_custom_${event.event}`]: event.payload,
          },
        };

      default:
        return msg;
    }
  });
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export function markMessageComplete(
  messages: ChatMessage[],
  messageId: string,
): ChatMessage[] {
  return messages.map((msg) =>
    msg.id === messageId
      ? { ...msg, status: "complete" as const }
      : msg,
  );
}

export function markMessageError(
  messages: ChatMessage[],
  messageId: string,
  error: string,
): ChatMessage[] {
  return messages.map((msg) =>
    msg.id === messageId
      ? {
          ...msg,
          status: "error" as const,
          metadata: { ...msg.metadata, error },
        }
      : msg,
  );
}

// ---------------------------------------------------------------------------
// Edit & Resend helpers (new)
// ---------------------------------------------------------------------------

/**
 * Replace a user message's content and truncate all messages after it.
 * Returns the truncated messages array (user msg updated, everything after removed).
 */
export function editUserMessage(
  messages: ChatMessage[],
  messageId: string,
  newContent: string,
): ChatMessage[] {
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1) return messages;
  const original = messages[idx]!;
  const updated: ChatMessage = {
    ...original,
    content: newContent,
  };
  // Truncate everything after the edited message
  return [...messages.slice(0, idx), updated];
}

/**
 * Remove the last assistant message (error/cancelled) so the user can resend.
 * Returns the truncated messages array.
 */
export function removeLastAssistantMessage(
  messages: ChatMessage[],
): ChatMessage[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "assistant") {
      return [...messages.slice(0, i), ...messages.slice(i + 1)];
    }
  }
  return messages;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function tryParseArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Return as raw string wrapped in an object while args are still streaming
    return { _raw: raw } as Record<string, unknown>;
  }
}
