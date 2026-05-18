import type { ChatMessage } from "../../types/message";

export type ChatTransportEvent =
  | { type: "text-delta"; textDelta: string }
  | { type: "tool-call-start"; toolCallId: string; toolName: string }
  | { type: "tool-call-delta"; toolCallId: string; argsDelta: string }
  | { type: "tool-call-end"; toolCallId: string; result?: unknown }
  | { type: "reasoning"; reasoning: string }
  | { type: "metadata"; data: Record<string, unknown> }
  | { type: "error"; error: string; code?: string }
  | { type: "custom"; event: string; payload: unknown };

export interface ChatTransportError {
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface ChatTransportEvents {
  onChunk: (event: ChatTransportEvent) => void;
  onComplete: () => void;
  onError: (error: ChatTransportError) => void;
}

export interface TransportContext {
  runId: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatTransportOptions {
  signal?: AbortSignal;
  context?: TransportContext;
}

export interface TransportRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ChatTransport {
  send(
    messages: ChatMessage[],
    events: ChatTransportEvents,
    options?: ChatTransportOptions,
  ): void;
  cancel?(): void;
  dispose?(): void;
}
