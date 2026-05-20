import type { AppendMessage, ThreadMessageLike } from "@assistant-ui/react";

export interface TextContentPart {
  type: "text";
  text: string;
}

export interface ToolCallContentPart {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export interface ReasoningStep {
  label: string;
  content?: string;
}

export interface ReasoningContentPart {
  type: "reasoning";
  steps: ReasoningStep[];
}

export interface ImageContentPart {
  type: "image";
  image: string;
  alt?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  contentType?: string;
  url?: string;
  type?: "image" | "document" | "file";
}


export interface DataContentPart<T = unknown> {
  type: `data-${string}`;
  data: T;
}

export type ChatContentPart =
  | TextContentPart
  | ReasoningContentPart
  | ToolCallContentPart
  | ImageContentPart
  | DataContentPart;

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageStatus =
  | "pending"
  | "streaming"
  | "complete"
  | "error"
  | "cancelled";

export interface ChatMessage {
  id: string;

  role: ChatMessageRole;

  content: string | ChatContentPart[];

  createdAt?: Date | string;

  status?: ChatMessageStatus;

  attachments?: FileAttachment[];

  metadata?: Record<string, unknown>;
}

export type { AppendMessage, ThreadMessageLike };

