import type { ISocket } from "@ldc/api-sdk/socket";
import { SocketClient } from "@ldc/api-sdk/socket";
import type { ChatMessage } from "../../types/message";
import type {
  ChatTransport,
  ChatTransportEvent,
  ChatTransportEvents,
  ChatTransportMiddleware,
  ChatTransportOptions,
  TransportRetryConfig,
} from "./types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface SocketTransportConfig {
  baseUrl: string;
  namespace?: string;
  room: string | ((context: { runId: string }) => string);
  channel?: string;
  eventKeyField?: string;
  completedEventKey?: string;
  errorEventKey?: string;
  timeout?: number;
  retry?: TransportRetryConfig;
  reconnect?: boolean;
  /** Custom event parser — return null to signal stream completed */
  parseEvent?: (raw: unknown) => ChatTransportEvent | null;
  /**
   * Join config — controls what happens after socket connects.
   * - `false` = don't emit anything on connect
   * - object = emit custom event/payload
   * - undefined (default) = emit "wait" with { room }
   */
  join?:
    | {
        event: string;
        payload:
          | Record<string, unknown>
          | ((context: { room: string; runId: string }) => Record<string, unknown>);
      }
    | false;
  /** Middleware for logging/analytics/error-tracking */
  middleware?: ChatTransportMiddleware;
  /** Additional SocketClient config (auth, query, etc.) */
  socketOptions?: {
    auth?: Record<string, unknown>;
    query?: Record<string, string>;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SocketTransport implements ChatTransport {
  private client: SocketClient | null = null;
  private iSocket: ISocket | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;

  private readonly channel: string;
  private readonly eventKeyField: string;
  private readonly completedEventKey: string;
  private readonly errorEventKey: string;
  private readonly timeout: number;
  private readonly config: SocketTransportConfig;

  constructor(config: SocketTransportConfig) {
    this.config = config;
    this.channel = config.channel ?? "data_chunk";
    this.eventKeyField = config.eventKeyField ?? "_event";
    this.completedEventKey = config.completedEventKey ?? "run_completed";
    this.errorEventKey = config.errorEventKey ?? "run_failed";
    this.timeout = config.timeout ?? 30_000;
  }

  send(
    messages: ChatMessage[],
    events: ChatTransportEvents,
    options?: ChatTransportOptions,
  ): void {
    const context = options?.context;
    if (!context?.runId) {
      events.onError({
        message: "runId is required in transport context",
        retryable: false,
      });
      return;
    }

    // --- Middleware: beforeSend ---
    let finalMessages = messages;
    let finalContext = context;
    if (this.config.middleware?.beforeSend) {
      const result = this.config.middleware.beforeSend(messages, context);
      finalMessages = result.messages;
      finalContext = result.context ?? context;
    }

    const room =
      typeof this.config.room === "function"
        ? this.config.room({ runId: finalContext.runId })
        : this.config.room;

    // --- Create SocketClient with correct API ---
    // SocketClient constructor takes { baseUrl, ... } config object.
    // namespace is passed to client.connect(), NOT the constructor.
    this.client = new SocketClient({
      baseUrl: this.config.baseUrl,
      reconnection: this.config.reconnect ?? true,
      ...(this.config.socketOptions ?? {}),
    });

    const namespace = this.config.namespace ?? "/";

    // --- Connect returns ISocket instance ---
    // SocketClient has no .on()/.emit() — must use ISocket from .connect()
    this.iSocket = this.client.connect(namespace);

    // --- Setup timeout ---
    this.timeoutId = setTimeout(() => {
      events.onError({
        message: "Transport timeout",
        code: "TIMEOUT",
        retryable: true,
      });
      this.dispose();
    }, this.timeout);

    // --- Data handler ---
    const dataHandler = (raw: unknown) => {
      const event = this.parseEvent(raw);

      if (!event) {
        // null = stream completed
        this.clearTimeout();
        this.config.middleware?.onComplete?.();
        events.onComplete();
        this.dispose();
        return;
      }

      if (event.type === "error") {
        this.clearTimeout();
        const error = {
          message: event.error,
          code: event.code,
          retryable: false,
        };
        const suppressed = this.config.middleware?.onError?.(error);
        if (!suppressed) {
          events.onError(error);
        }
        this.dispose();
        return;
      }

      // --- Middleware: onChunk ---
      this.config.middleware?.onChunk?.(event);
      events.onChunk(event);
    };

    // --- CRITICAL: emit join ONLY after "connect" event ---
    // Pre-connect emits are silently dropped by socket.io.
    this.iSocket.on("connect", () => {
      const joinConfig = this.config.join;

      // join === false means don't emit anything
      if (joinConfig === false) return;

      const event = joinConfig?.event ?? "wait";
      const payload =
        typeof joinConfig?.payload === "function"
          ? joinConfig.payload({ room, runId: finalContext.runId })
          : (joinConfig?.payload ?? { room });

      if (this.iSocket) {
        this.iSocket.emit(event, payload);
      }
    });

    // --- Listen for data on channel ---
    this.iSocket.on(this.channel, dataHandler);

    // --- Listen for socket-level errors ---
    this.iSocket.on("connect_error", (err: unknown) => {
      const retry = this.config.retry;
      const maxRetries = retry?.maxRetries ?? 0;

      if (this.retryAttempt < maxRetries) {
        this.retryAttempt++;
        const delay =
          (retry?.retryDelay ?? 1000) *
          Math.pow(retry?.backoffMultiplier ?? 2, this.retryAttempt - 1);

        retry?.onRetry?.(
          this.retryAttempt,
          err instanceof Error ? err : new Error(String(err)),
        );

        // SocketClient's built-in reconnection handles the actual reconnect,
        // but we track attempts for the onRetry callback.
        // If maxRetries exceeded on next attempt, we'll fall through to error.
      } else if (maxRetries > 0) {
        this.clearTimeout();
        const error = {
          message: `Connection failed after ${maxRetries} retries: ${
            err instanceof Error ? err.message : String(err)
          }`,
          code: "CONNECT_ERROR",
          retryable: false,
        };
        const suppressed = this.config.middleware?.onError?.(error);
        if (!suppressed) {
          events.onError(error);
        }
        this.dispose();
      }
    });

    this.iSocket.on("disconnect", (reason: unknown) => {
      // Only treat unexpected disconnects as errors
      // "io client disconnect" means we called .disconnect() ourselves
      if (reason !== "io client disconnect" && reason !== "io server disconnect") {
        return; // socket.io will auto-reconnect if configured
      }
      if (reason === "io server disconnect") {
        this.clearTimeout();
        const error = {
          message: "Server disconnected",
          code: "SERVER_DISCONNECT",
          retryable: true,
        };
        const suppressed = this.config.middleware?.onError?.(error);
        if (!suppressed) {
          events.onError(error);
        }
        this.dispose();
      }
    });

    // --- Abort signal ---
    options?.signal?.addEventListener("abort", () => {
      this.clearTimeout();
      this.dispose();
    });
  }

  cancel(): void {
    this.clearTimeout();
    this.dispose();
  }

  dispose(): void {
    // CRITICAL: remove listeners from ISocket BEFORE disconnecting client
    // iSocket.off() removes specific listeners; client.disconnectAll() closes connections
    if (this.iSocket) {
      this.iSocket.off(this.channel);
      this.iSocket.off("connect");
      this.iSocket.off("connect_error");
      this.iSocket.off("disconnect");
      this.iSocket = null;
    }
    if (this.client) {
      this.client.disconnectAll();
      this.client = null;
    }
    this.retryAttempt = 0;
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private parseEvent(raw: unknown): ChatTransportEvent | null {
    // Allow custom parser to fully control event parsing
    if (this.config.parseEvent) {
      return this.config.parseEvent(raw);
    }

    const data = raw as Record<string, unknown>;
    const eventKey = data[this.eventKeyField] as string | undefined;

    if (eventKey === this.completedEventKey) return null;
    if (eventKey === this.errorEventKey) {
      return {
        type: "error",
        error: (data.message as string) || "Unknown error",
        code: data.code as string | undefined,
      };
    }

    // Auto-detect tool-call events
    if (eventKey === "tool_call_start" || data._type === "tool-call-start") {
      return {
        type: "tool-call-start",
        toolCallId: (data.toolCallId ?? data.tool_call_id) as string,
        toolName: (data.toolName ?? data.tool_name) as string,
      };
    }
    if (eventKey === "tool_call_delta" || data._type === "tool-call-delta") {
      return {
        type: "tool-call-delta",
        toolCallId: (data.toolCallId ?? data.tool_call_id) as string,
        argsDelta: (data.argsDelta ?? data.args_delta ?? "") as string,
      };
    }
    if (eventKey === "tool_call_end" || data._type === "tool-call-end") {
      return {
        type: "tool-call-end",
        toolCallId: (data.toolCallId ?? data.tool_call_id) as string,
        result: data.result,
      };
    }

    // Text content
    if (typeof data.content === "string") {
      return { type: "text-delta", textDelta: data.content };
    }

    // Fallback to custom event
    return { type: "custom", event: eventKey ?? "unknown", payload: data };
  }
}
