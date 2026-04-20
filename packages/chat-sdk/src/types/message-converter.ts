import type { ThreadMessageLike } from "@assistant-ui/react";
import type {
  ChatContentPart,
  ChatMessage
} from "../types/message";

export function defaultConvertMessage(
  message: ChatMessage,
): ThreadMessageLike {
  return {
    id: message.id,
    role: message.role,
    content: normalizeContent(message.content),
    createdAt: message.createdAt
      ? new Date(message.createdAt)
      : undefined,
    attachments: message.attachments?.map((att) => ({
      id: att.id,
      type: att.contentType?.startsWith("image/") ? "image" : "document",
      name: att.name,
      contentType: att.contentType,
      status: { type: "complete" },
      content: [],
    })),
    status: mapStatus(message),
  };
}

function normalizeContent(
  content: string | ChatContentPart[],
): ThreadMessageLike["content"] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  return content.map(convertPart) as ThreadMessageLike["content"];
}

function convertPart(
  part: ChatContentPart,
): ThreadMessageLike["content"][number] {
  switch (part.type) {
    case "text":
      return { type: "text", text: (part).text };

    case "tool-call": {
      const tc = part;
      return {
        type: "tool-call",
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args: tc.args as unknown as Record<string, never>,
        result: tc.result,
      };
    }

    case "image":
      return {
        type: "image",
        image: (part).image,
      };

    default:
      if (part.type.startsWith("data-")) {
        return part as never;
      }
      return { type: "text", text: `[unsupported: ${part.type}]` };
  }
}

function mapStatus(
  message: ChatMessage,
): ThreadMessageLike["status"] | undefined {
  if (message.role !== "assistant") return undefined;

  switch (message.status) {
    case "streaming":
      return { type: "running" };
    case "error":
      return {
        type: "incomplete",
        reason: "error",
      };
    case "cancelled":
      return {
        type: "incomplete",
        reason: "cancelled",
      };
    case "complete":
      return { type: "complete", reason: "stop" };
    default:
      return undefined;
  }
}
