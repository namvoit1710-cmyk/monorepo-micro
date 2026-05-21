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

export interface SSETransportConfig {
  url: string | ((messages: ChatMessage[]) => string);
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  buildBody?: (messages: ChatMessage[]) => unknown;
  parseEvent?: (data: string, eventType?: string) => ChatTransportEvent | null;
  /** Retry config for network failures — exponential backoff */
  retry?: TransportRetryConfig;
  /** Middleware for logging/analytics/error-tracking */
  middleware?: ChatTransportMiddleware;
  /** Timeout in ms for the initial fetch (default: 30000) */
  timeout?: number;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SSETransport implements ChatTransport {
  private abortController: AbortController | null = null;

  constructor(private readonly config: SSETransportConfig) {}

  send(
    messages: ChatMessage[],
    events: ChatTransportEvents,
    options?: ChatTransportOptions,
  ): void {
    this.abortController = new AbortController();
    const signal = options?.signal
      ? anySignal([options.signal, this.abortController.signal])
      : this.abortController.signal;

    // --- Middleware: beforeSend ---
    let finalMessages = messages;
    if (this.config.middleware?.beforeSend) {
      const result = this.config.middleware.beforeSend(
        messages,
        options?.context,
      );
      finalMessages = result.messages;
    }

    const url =
      typeof this.config.url === "function"
        ? this.config.url(finalMessages)
        : this.config.url;

    const fetchOptions: RequestInit = {
      method: this.config.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...this.config.headers,
      },
      body:
        this.config.method === "GET"
          ? undefined
          : JSON.stringify(
              this.config.buildBody
                ? this.config.buildBody(finalMessages)
                : { messages: finalMessages },
            ),
      signal,
    };

    void this.streamWithRetry(url, fetchOptions, events, 0);
  }

  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  dispose(): void {
    this.cancel();
  }

  // ---------------------------------------------------------------------------
  // Retry wrapper
  // ---------------------------------------------------------------------------

  private async streamWithRetry(
    url: string,
    fetchOptions: RequestInit,
    events: ChatTransportEvents,
    attempt: number,
  ): Promise<void> {
    try {
      await this.streamResponse(url, fetchOptions, events);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      const maxRetries = this.config.retry?.maxRetries ?? 0;
      if (attempt < maxRetries) {
        const delay =
          (this.config.retry?.retryDelay ?? 1000) *
          Math.pow(this.config.retry?.backoffMultiplier ?? 2, attempt);

        this.config.retry?.onRetry?.(
          attempt + 1,
          error instanceof Error ? error : new Error(String(error)),
        );

        await sleep(delay);

        // Check if cancelled during sleep
        if (this.abortController?.signal.aborted) return;

        return this.streamWithRetry(url, fetchOptions, events, attempt + 1);
      }

      const transportError = {
        message: (error as Error).message,
        retryable: true,
      };
      const suppressed = this.config.middleware?.onError?.(transportError);
      if (!suppressed) {
        events.onError(transportError);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Core streaming
  // ---------------------------------------------------------------------------

  private async streamResponse(
    url: string,
    fetchOptions: RequestInit,
    events: ChatTransportEvents,
  ): Promise<void> {
    const timeoutMs = this.config.timeout ?? 30_000;
    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok || !response.body) {
        const error = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: String(response.status),
          retryable: response.status >= 500,
        };
        const suppressed = this.config.middleware?.onError?.(error);
        if (!suppressed) {
          events.onError(error);
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEventType: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          // SSE spec: "event:" sets the event type for the next "data:" line
          if (line.startsWith("event: ") || line.startsWith("event:")) {
            currentEventType = line.slice(line.indexOf(":") + 1).trim();
            continue;
          }

          if (!line.startsWith("data: ") && !line.startsWith("data:")) {
            // Empty line resets event type per SSE spec
            if (line.trim() === "") {
              currentEventType = undefined;
            }
            continue;
          }

          const data = line.slice(line.indexOf(":") + 1).trim();
          if (data === "[DONE]") continue;

          const event = this.config.parseEvent
            ? this.config.parseEvent(data, currentEventType)
            : this.defaultParseEvent(data, currentEventType);

          if (event) {
            // --- Middleware: onChunk ---
            this.config.middleware?.onChunk?.(event);
            events.onChunk(event);
          }

          // Reset event type after processing data
          currentEventType = undefined;
        }
      }

      this.config.middleware?.onComplete?.();
      events.onComplete();
    } catch (error) {
      clearTimeout(timeoutId);
      // Re-throw for retry logic to handle
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Default parser — handles both JSON and plain text
  // ---------------------------------------------------------------------------

  private defaultParseEvent(
    data: string,
    eventType?: string,
  ): ChatTransportEvent | null {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;

      // If SSE event type is specified, use it to determine transport event type
      if (eventType) {
        switch (eventType) {
          case "text-delta":
            return {
              type: "text-delta",
              textDelta: (parsed.textDelta ?? parsed.content ?? data) as string,
            };
          case "tool-call-start":
            return {
              type: "tool-call-start",
              toolCallId: (parsed.toolCallId ?? parsed.tool_call_id) as string,
              toolName: (parsed.toolName ?? parsed.tool_name) as string,
            };
          case "tool-call-delta":
            return {
              type: "tool-call-delta",
              toolCallId: (parsed.toolCallId ?? parsed.tool_call_id) as string,
              argsDelta: (parsed.argsDelta ?? parsed.args_delta ?? "") as string,
            };
          case "tool-call-end":
            return {
              type: "tool-call-end",
              toolCallId: (parsed.toolCallId ?? parsed.tool_call_id) as string,
              result: parsed.result,
            };
          case "error":
            return {
              type: "error",
              error: (parsed.error ?? parsed.message ?? "Unknown error") as string,
              code: parsed.code as string | undefined,
            };
          default:
            return { type: "custom", event: eventType, payload: parsed };
        }
      }

      // Fallback: infer from JSON content
      if (typeof parsed.content === "string") {
        return { type: "text-delta", textDelta: parsed.content };
      }

      return {
        type: "custom",
        event: (parsed.type as string) ?? "data",
        payload: parsed,
      };
    } catch {
      // Not JSON — treat as plain text delta
      return { type: "text-delta", textDelta: data };
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener(
      "abort",
      () => controller.abort(signal.reason),
      { once: true },
    );
  }
  return controller.signal;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
