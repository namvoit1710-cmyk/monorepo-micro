import type { ChatMessage } from "../../types/message";
import type {
  ChatTransport,
  ChatTransportEvent,
  ChatTransportEvents,
  ChatTransportOptions,
} from "./types";

export interface SSETransportConfig {
  url: string | ((messages: ChatMessage[]) => string);
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  buildBody?: (messages: ChatMessage[]) => unknown;
  parseEvent?: (data: string, eventType?: string) => ChatTransportEvent | null;
}

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

    const url =
      typeof this.config.url === "function"
        ? this.config.url(messages)
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
                ? this.config.buildBody(messages)
                : { messages },
            ),
      signal,
    };

    void this.streamResponse(url, fetchOptions, events);
  }

  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  dispose(): void {
    this.cancel();
  }

  private async streamResponse(
    url: string,
    fetchOptions: RequestInit,
    events: ChatTransportEvents,
  ): Promise<void> {
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok || !response.body) {
        events.onError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: String(response.status),
          retryable: response.status >= 500,
        });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          const event = this.config.parseEvent
            ? this.config.parseEvent(data)
            : this.defaultParseEvent(data);

          if (event) events.onChunk(event);
        }
      }

      events.onComplete();
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      events.onError({
        message: (error as Error).message,
        retryable: true,
      });
    }
  }

  private defaultParseEvent(data: string): ChatTransportEvent | null {
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>;
      if (typeof parsed.content === "string") {
        return { type: "text-delta", textDelta: parsed.content };
      }
      return {
        type: "custom",
        event: (parsed.type as string) ?? "data",
        payload: parsed,
      };
    } catch {
      return { type: "text-delta", textDelta: data };
    }
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
