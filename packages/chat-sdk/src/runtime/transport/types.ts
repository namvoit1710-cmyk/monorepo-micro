import type { ChatMessage, ReasoningStep } from "../../types/message";

// ---------------------------------------------------------------------------
// Transport Events — discriminated union
// ---------------------------------------------------------------------------

export type ChatTransportEvent =
  | { type: "text-delta"; textDelta: string }
  | { type: "tool-call-start"; toolCallId: string; toolName: string }
  | { type: "tool-call-delta"; toolCallId: string; argsDelta: string }
  | { type: "tool-call-end"; toolCallId: string; result?: unknown }
  | { type: "reasoning"; step: ReasoningStep }
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

// ---------------------------------------------------------------------------
// Transport Context & Options
// ---------------------------------------------------------------------------

export interface TransportContext {
  runId: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatTransportOptions {
  signal?: AbortSignal;
  context?: TransportContext;
}

// ---------------------------------------------------------------------------
// Retry Config
// ---------------------------------------------------------------------------

export interface TransportRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

// ---------------------------------------------------------------------------
// Middleware — interceptor seam for logging/analytics/error-tracking
// ---------------------------------------------------------------------------

export interface ChatTransportMiddleware {
  /** Called before transport.send — can modify messages or context */
  beforeSend?: (
    messages: ChatMessage[],
    context?: TransportContext,
  ) => { messages: ChatMessage[]; context?: TransportContext };

  /** Called on every chunk — for logging/analytics */
  onChunk?: (event: ChatTransportEvent) => void;

  /** Called on complete */
  onComplete?: () => void;

  /** Called on error — return true to suppress default error handling */
  onError?: (error: ChatTransportError) => boolean | void;
}

// ---------------------------------------------------------------------------
// Transport Interface
// ---------------------------------------------------------------------------

export interface ChatTransport {
  send(
    messages: ChatMessage[],
    events: ChatTransportEvents,
    options?: ChatTransportOptions,
  ): void;
  cancel?(): void;
  dispose?(): void;
}
