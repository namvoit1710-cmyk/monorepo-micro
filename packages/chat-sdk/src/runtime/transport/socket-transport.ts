import { SocketClient } from "@ldc/api-sdk/socket";
import type { ISocket } from "@ldc/api-sdk/socket";
import type { ChatMessage } from "../../types/message";
import type {
  ChatTransport,
  ChatTransportEvent,
  ChatTransportEvents,
  ChatTransportOptions,
  TransportRetryConfig,
} from "./types";

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
}

export class SocketTransport implements ChatTransport {
  private client: SocketClient | null = null;
  private iSocket: ISocket | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

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
    _messages: ChatMessage[],
    events: ChatTransportEvents,
    options?: ChatTransportOptions,
  ): void {
    const context = options?.context;
    if (!context?.runId) {
      events.onError({ message: "runId is required in transport context", retryable: false });
      return;
    }

    const room =
      typeof this.config.room === "function"
        ? this.config.room({ runId: context.runId })
        : this.config.room;

    this.client = new SocketClient({
      baseUrl: this.config.baseUrl,
      reconnection: this.config.reconnect ?? true,
    });

    const namespace = this.config.namespace ?? "/";
    this.iSocket = this.client.connect(namespace);

    this.timeoutId = setTimeout(() => {
      events.onError({ message: "Transport timeout", code: "TIMEOUT", retryable: true });
      this.dispose();
    }, this.timeout);

    const dataHandler = (raw: unknown) => {
      const event = this.parseEvent(raw);
      if (!event) {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        events.onComplete();
        this.dispose();
        return;
      }
      if (event.type === "error") {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        events.onError({ message: event.error, code: event.code, retryable: false });
        this.dispose();
        return;
      }
      events.onChunk(event);
    };

    this.iSocket.on("connect", () => {
      this.iSocket!.emit("wait", { room });
    });

    this.iSocket.on(this.channel, dataHandler);

    options?.signal?.addEventListener("abort", () => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.dispose();
    });
  }

  cancel(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.dispose();
  }

  dispose(): void {
    if (this.iSocket) {
      this.iSocket.off(this.channel);
      this.iSocket.off("connect");
      this.iSocket = null;
    }
    if (this.client) {
      this.client.disconnectAll();
      this.client = null;
    }
  }

  private parseEvent(raw: unknown): ChatTransportEvent | null {
    const data = raw as Record<string, unknown>;
    const eventKey = data[this.eventKeyField] as string | undefined;

    if (eventKey === this.completedEventKey) return null;
    if (eventKey === this.errorEventKey) {
      return { type: "error", error: (data.message as string) ?? "Unknown error" };
    }

    if (typeof data.content === "string") {
      return { type: "text-delta", textDelta: data.content };
    }

    return { type: "custom", event: eventKey ?? "unknown", payload: data };
  }
}
