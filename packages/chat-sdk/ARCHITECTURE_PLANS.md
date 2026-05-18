# Chat SDK Runtime Architecture — Implementation Plan (v3, planner-reviewed)

## Context

`packages/chat-sdk` has rich UI components (Thread, Composer, Message, etc.) cloned from assistant-ui, but the runtime layer is missing. A parallel `useAIAssistantRuntime` exists in `apps/workflow-management` — hardcoded to that app's API. The goal is to build a generalized, reusable runtime layer inside `packages/chat-sdk` so any app can plug in its own agentic backend via a clean transport interface, with protocol switching (WebSocket / SSE) abstracted behind a single seam.

This document supersedes the original plan with optimizations identified during architecture review.

---

## Architecture Overview

```
packages/chat-sdk/src/
├── runtime/
│   ├── index.ts
│   ├── use-chat-runtime.ts              ← wires store + actions → useExternalStoreRuntime
│   ├── use-chat-actions.ts              ← orchestrates transport → store updates
│   ├── store/
│   │   ├── types.ts                     ← ChatStoreAdapter interface
│   │   └── use-default-chat-store.ts    ← built-in useState-based store
│   └── transport/
│       ├── types.ts                     ← ChatTransport + ChatTransportEvent (typed)
│       ├── socket-transport.ts          ← Socket.IO implementation
│       └── sse-transport.ts             ← SSE/fetch-stream implementation
├── provider/
│   └── chat-runtime-provider.tsx        ← AssistantRuntimeProvider wrapper
├── helpers/
│   └── message-helpers.ts              ← appendMessageToChatMessage, updateLastAssistant, etc.
├── types/                               ← existing message/thread/adapter types
├── components/                          ← existing cloned UI components
└── index.ts
```

---

## Key Changes from Original Plan

| Area | Original Plan | Revised | Why |
|------|--------------|---------|-----|
| Transport return type | `AsyncIterable<ChatTransportMessage>` | Callback-based `ChatTransportEvents` | Socket.IO/SSE are push-based; wrapping into pull creates unnecessary buffering |
| Event typing | `event: string` | Discriminated union `ChatTransportEvent` | Type safety, autocomplete, exhaustive switch |
| State ownership | `useChatStore` with internal `useState` | `ChatStoreAdapter` interface — injectable | Lets consumers use zustand/redux/tanstack-query instead of being locked to internal state |
| Hook composition | Monolithic `useChatRuntime` | 3 composable hooks: `useDefaultChatStore` → `useChatActions` → `useChatRuntime` | Each layer is independently replaceable |
| Trigger logic | `triggerFn` inside `SocketTransportConfig` | `beforeSend` callback in `useChatActions` | Decouples "call API to start run" from "listen for socket events" |
| Message conversion | Inline `convertMessage` | `useExternalMessageConverter` with `joinStrategy` | Handles adjacent assistant message merging (needed for multi-chunk streaming) |
| Error recovery | Not addressed | `TransportRetryConfig` on transport | Production requirement for socket disconnects mid-stream |

---

## Design Decisions

### 1. Callback-based Transport instead of AsyncIterable

The original plan returns `AsyncIterable<ChatTransportMessage>` from `transport.send()`. This imposes a pull model — the consumer must `for await` to receive data. But Socket.IO and SSE are inherently push-based: the server emits events at its own pace.

Wrapping push into pull requires an internal buffer and complex backpressure handling. More importantly, `useExternalStoreRuntime` does not consume an iterator — it simply needs `setMessages()` called whenever state changes. The callback model maps directly to both the transport layer and the runtime layer without an intermediate abstraction.

```typescript
export interface ChatTransportEvents {
  onChunk: (event: ChatTransportEvent) => void;
  onComplete: () => void;
  onError: (error: ChatTransportError) => void;
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
```

### 2. Injectable Store Adapter instead of Internal State

The original `useChatStore` holds `useState<ChatMessage[]>` internally. This prevents consumers from:

- Persisting messages via tanstack-query cache
- Sharing message state across components via zustand
- Integrating with existing redux stores in the host app

The solution: define `ChatStoreAdapter` as an interface and ship a default `useDefaultChatStore` implementation. Consumers inject whichever store they want.

```typescript
export interface ChatStoreAdapter {
  messages: readonly ChatMessage[];
  isRunning: boolean;
  setMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setIsRunning: (running: boolean) => void;
}
```

Three usage modes:

```typescript
// Mode 1: Built-in store (simplest)
const store = useDefaultChatStore();

// Mode 2: Zustand store
const store: ChatStoreAdapter = {
  messages: useChatStore(s => s.messages),
  isRunning: useChatStore(s => s.isRunning),
  setMessages: useChatStore(s => s.setMessages),
  setIsRunning: useChatStore(s => s.setIsRunning),
};

// Mode 3: Tanstack Query (read) + mutation (write)
const { data: messages } = useQuery({ queryKey: ['chat', threadId], ... });
const store: ChatStoreAdapter = {
  messages: messages ?? [],
  isRunning,
  setMessages: (msgs) => queryClient.setQueryData(['chat', threadId], msgs),
  setIsRunning,
};
```

### 3. Composable Hook Chain instead of Monolithic Hook

The original plan bundles transport, store, and runtime wiring into a single `useChatRuntime`. If a consumer needs custom `onNew` logic (middleware, logging, optimistic updates), they must fork the entire hook.

Revised approach: three independent hooks that compose linearly.

```
useDefaultChatStore() → useChatActions(transport, store) → useChatRuntime(store, actions)
```

Each hook is independently replaceable:

```typescript
// Replace just the actions layer
const store = useDefaultChatStore();
const actions = useMyCustomActions(transport, store); // own send logic
const runtime = useChatRuntime(store, actions);

// Replace just the store layer
const store = useZustandChatStore();
const actions = useChatActions(transport, store);
const runtime = useChatRuntime(store, actions);
```

### 4. Discriminated Union Events instead of String Events

The original plan uses `event: string` for transport messages. This provides no compile-time safety, no autocomplete, and no exhaustive pattern matching.

Revised: typed discriminated union covering all known event shapes.

```typescript
export type ChatTransportEvent =
  | { type: "text-delta"; textDelta: string }
  | { type: "tool-call-start"; toolCallId: string; toolName: string }
  | { type: "tool-call-delta"; toolCallId: string; argsDelta: string }
  | { type: "tool-call-end"; toolCallId: string; result?: unknown }
  | { type: "reasoning"; reasoning: string }
  | { type: "metadata"; data: Record<string, unknown> }
  | { type: "error"; error: string; code?: string }
  | { type: "custom"; event: string; payload: unknown };
```

The `custom` variant serves as an escape hatch for domain-specific events without weakening the type system for known events.

### 5. Trigger Logic Decoupled from Transport

The original plan puts `triggerFn: (messages) => Promise<{ run_id: string }>` inside `SocketTransportConfig`. This couples the transport to a specific API call pattern. In practice, trigger and listen are separate concerns — you might trigger via REST but listen via SSE, or trigger via GraphQL mutation.

Revised: transport only handles listening. Trigger logic lives in `useChatActions` via a `beforeSend` callback.

```typescript
const actions = useChatActions(transport, store, {
  beforeSend: async (messages) => {
    const { run_id } = await agentApi.post("/ai/chat", { messages });
    return { runId: run_id };
  },
});
```

The returned context (`{ runId }`) is passed to `transport.send()` so SocketTransport can join the correct room.

### 6. useExternalMessageConverter for Performance

The original plan uses inline `convertMessage`. assistant-ui v0.12+ provides `useExternalMessageConverter` which supports `joinStrategy: "concat-content"` — merging adjacent assistant messages into one. This is critical when agents stream multiple message chunks as separate messages (common with tool-call interleaving).

```typescript
const convertedMessages = useExternalMessageConverter({
  callback: defaultConvertMessage,
  messages: store.messages,
  isRunning: store.isRunning,
  joinStrategy: "concat-content",
});
```

### 7. Transport-level Retry and Reconnect

The original plan does not address connection failures. In production, socket disconnects mid-stream are common (network switches, server deploys). Without retry logic, the user sees a frozen UI with no error feedback.

```typescript
export interface TransportRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface SocketTransportConfig {
  // ...existing fields
  retry?: TransportRetryConfig;
  reconnect?: boolean;
}
```

SocketTransport uses `SocketClient` from `@ldc/api-sdk/socket` which already supports reconnection — the config surfaces that capability to the SDK consumer.

---

## Files to Create

### 1. `runtime/transport/types.ts` — Protocol Seam

```typescript
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
```

### 2. `runtime/store/types.ts` — Store Adapter Interface

```typescript
import type { ChatMessage } from "../../types/message";

export interface ChatStoreAdapter {
  messages: readonly ChatMessage[];
  isRunning: boolean;
  setMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void;
  setIsRunning: (running: boolean) => void;
}
```

### 3. `runtime/store/use-default-chat-store.ts` — Built-in Store

```typescript
import { useState, useCallback } from "react";
import type { ChatMessage } from "../../types/message";
import type { ChatStoreAdapter } from "./types";

export function useDefaultChatStore(
  initialMessages?: ChatMessage[],
): ChatStoreAdapter {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [],
  );
  const [isRunning, setIsRunning] = useState(false);

  const stableSetMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setMessages(typeof updater === "function" ? updater : () => updater);
    },
    [],
  );

  return {
    messages,
    isRunning,
    setMessages: stableSetMessages,
    setIsRunning,
  };
}
```

### 4. `runtime/use-chat-actions.ts` — Transport-to-Store Orchestration

```typescript
import { useCallback, useRef } from "react";
import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage } from "../types/message";
import type { ChatTransport, ChatTransportEvent, TransportContext } from "./transport/types";
import type { ChatStoreAdapter } from "./store/types";
import {
  appendMessageToChatMessage,
  createStreamingAssistantMessage,
  updateAssistantMessageFromEvent,
  markMessageComplete,
  markMessageError,
} from "../helpers/message-helpers";

export interface ChatActionsConfig {
  beforeSend?: (messages: ChatMessage[]) => Promise<TransportContext>;
}

export interface ChatActions {
  onNew: (message: AppendMessage) => Promise<void>;
  onCancel?: () => void;
}

export function useChatActions(
  transport: ChatTransport,
  store: ChatStoreAdapter,
  config?: ChatActionsConfig,
): ChatActions {
  const transportRef = useRef(transport);
  transportRef.current = transport;

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const userMsg = appendMessageToChatMessage(message);
      store.setMessages((prev) => [...prev, userMsg]);
      store.setIsRunning(true);

      const assistantMsg = createStreamingAssistantMessage();
      store.setMessages((prev) => [...prev, assistantMsg]);

      let context: TransportContext | undefined;
      if (config?.beforeSend) {
        context = await config.beforeSend([...store.messages, userMsg]);
      }

      transportRef.current.send(
        [...store.messages, userMsg],
        {
          onChunk: (event: ChatTransportEvent) => {
            store.setMessages((prev) =>
              updateAssistantMessageFromEvent(prev, assistantMsg.id, event),
            );
          },
          onComplete: () => {
            store.setMessages((prev) =>
              markMessageComplete(prev, assistantMsg.id),
            );
            store.setIsRunning(false);
          },
          onError: (error) => {
            store.setMessages((prev) =>
              markMessageError(prev, assistantMsg.id, error.message),
            );
            store.setIsRunning(false);
          },
        },
        { context },
      );
    },
    [store, config],
  );

  const onCancel = useCallback(() => {
    transportRef.current.cancel?.();
    store.setIsRunning(false);
  }, [store]);

  return { onNew, onCancel: transport.cancel ? onCancel : undefined };
}
```

### 5. `runtime/use-chat-runtime.ts` — Wire to assistant-ui

```typescript
import {
  useExternalStoreRuntime,
  useExternalMessageConverter,
} from "@assistant-ui/react";
import { defaultConvertMessage } from "./message-converter";
import type { ChatStoreAdapter } from "./store/types";
import type { ChatActions } from "./use-chat-actions";
import type { ChatMessage } from "../types/message";
import type { ThreadMessageLike } from "@assistant-ui/react";

export interface ChatRuntimeConfig {
  convertMessage?: (message: ChatMessage) => ThreadMessageLike;
  joinStrategy?: "concat-content" | "none";
}

export function useChatRuntime(
  store: ChatStoreAdapter,
  actions: ChatActions,
  config?: ChatRuntimeConfig,
) {
  const convertedMessages = useExternalMessageConverter({
    callback: config?.convertMessage ?? defaultConvertMessage,
    messages: store.messages,
    isRunning: store.isRunning,
    joinStrategy: config?.joinStrategy ?? "concat-content",
  });

  return useExternalStoreRuntime({
    messages: convertedMessages,
    onNew: actions.onNew,
    onCancel: actions.onCancel,
    setMessages: store.setMessages,
  });
}
```

### 6. `runtime/transport/socket-transport.ts` — Socket.IO Implementation

```typescript
import { SocketClient } from "@ldc/api-sdk/socket";
import type { ChatMessage } from "../../types/message";
import type {
  ChatTransport,
  ChatTransportEvents,
  ChatTransportOptions,
  ChatTransportEvent,
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
  private socket: SocketClient | null = null;
  private config: Required<
    Pick<SocketTransportConfig, "channel" | "eventKeyField" | "completedEventKey" | "errorEventKey" | "timeout">
  > & SocketTransportConfig;

  constructor(config: SocketTransportConfig) {
    this.config = {
      channel: "data_chunk",
      eventKeyField: "_event",
      completedEventKey: "run_completed",
      errorEventKey: "run_failed",
      timeout: 30_000,
      ...config,
    };
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

    this.socket = new SocketClient(this.config.baseUrl, {
      namespace: this.config.namespace,
    });

    const timeoutId = setTimeout(() => {
      events.onError({ message: "Transport timeout", code: "TIMEOUT", retryable: true });
      this.dispose();
    }, this.config.timeout);

    this.socket.emit("wait", { room });

    this.socket.on(this.config.channel, (raw: unknown) => {
      const event = this.parseEvent(raw);
      if (!event) {
        clearTimeout(timeoutId);
        events.onComplete();
        this.dispose();
        return;
      }
      if (event.type === "error") {
        clearTimeout(timeoutId);
        events.onError({ message: event.error, code: event.code, retryable: false });
        this.dispose();
        return;
      }
      events.onChunk(event);
    });

    options?.signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      this.dispose();
    });
  }

  cancel(): void {
    this.dispose();
  }

  dispose(): void {
    this.socket?.disconnectAll();
    this.socket = null;
  }

  private parseEvent(raw: unknown): ChatTransportEvent | null {
    const data = raw as Record<string, unknown>;
    const eventKey = data[this.config.eventKeyField] as string | undefined;

    if (eventKey === this.config.completedEventKey) return null;
    if (eventKey === this.config.errorEventKey) {
      return { type: "error", error: (data.message as string) ?? "Unknown error" };
    }

    if (typeof data.content === "string") {
      return { type: "text-delta", textDelta: data.content };
    }

    return { type: "custom", event: eventKey ?? "unknown", payload: data };
  }
}
```

### 7. `runtime/transport/sse-transport.ts` — SSE Implementation

```typescript
import type { ChatMessage } from "../../types/message";
import type {
  ChatTransport,
  ChatTransportEvents,
  ChatTransportOptions,
  ChatTransportEvent,
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

  constructor(private config: SSETransportConfig) {}

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
      body: this.config.method === "GET"
        ? undefined
        : JSON.stringify(
            this.config.buildBody
              ? this.config.buildBody(messages)
              : { messages },
          ),
      signal,
    };

    this.streamResponse(url, fetchOptions, events);
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
      const parsed = JSON.parse(data);
      if (typeof parsed.content === "string") {
        return { type: "text-delta", textDelta: parsed.content };
      }
      return { type: "custom", event: parsed.type ?? "data", payload: parsed };
    } catch {
      return { type: "text-delta", textDelta: data };
    }
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(signal.reason); return controller.signal; }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}
```

### 8. `helpers/message-helpers.ts` — Pure Functions

```typescript
import type { AppendMessage } from "@assistant-ui/react";
import type { ChatMessage, ChatTransportEvent } from "../types";

let counter = 0;
function generateId(): string {
  return `msg_${Date.now()}_${++counter}`;
}

export function appendMessageToChatMessage(message: AppendMessage): ChatMessage {
  const text = message.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  return {
    id: generateId(),
    role: "user",
    content: text,
    createdAt: new Date(),
    status: "complete",
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
        const currentText = typeof msg.content === "string" ? msg.content : "";
        return { ...msg, content: currentText + event.textDelta };
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
```

### 9. `provider/chat-runtime-provider.tsx` — Provider Component

```typescript
import type { ReactNode } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import type { ChatTransport, TransportContext } from "../runtime/transport/types";
import type { ChatStoreAdapter } from "../runtime/store/types";
import type { ChatMessage } from "../types/message";
import type { ThreadMessageLike } from "@assistant-ui/react";
import { useDefaultChatStore } from "../runtime/store/use-default-chat-store";
import { useChatActions } from "../runtime/use-chat-actions";
import { useChatRuntime } from "../runtime/use-chat-runtime";

export interface ChatRuntimeProviderProps {
  transport: ChatTransport;
  children: ReactNode;
  store?: ChatStoreAdapter;
  beforeSend?: (messages: ChatMessage[]) => Promise<TransportContext>;
  convertMessage?: (message: ChatMessage) => ThreadMessageLike;
  joinStrategy?: "concat-content" | "none";
}

export function ChatRuntimeProvider({
  transport,
  children,
  store: externalStore,
  beforeSend,
  convertMessage,
  joinStrategy,
}: ChatRuntimeProviderProps) {
  const defaultStore = useDefaultChatStore();
  const store = externalStore ?? defaultStore;
  const actions = useChatActions(transport, store, { beforeSend });
  const runtime = useChatRuntime(store, actions, { convertMessage, joinStrategy });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### 10. `runtime/index.ts` — Runtime Re-exports

```typescript
export type { ChatTransport, ChatTransportEvent, ChatTransportError, ChatTransportEvents, ChatTransportOptions, TransportContext, TransportRetryConfig } from "./transport/types";
export type { ChatStoreAdapter } from "./store/types";
export type { ChatActions, ChatActionsConfig } from "./use-chat-actions";
export type { ChatRuntimeConfig } from "./use-chat-runtime";
export { SocketTransport } from "./transport/socket-transport";
export type { SocketTransportConfig } from "./transport/socket-transport";
export { SSETransport } from "./transport/sse-transport";
export type { SSETransportConfig } from "./transport/sse-transport";
export { useDefaultChatStore } from "./store/use-default-chat-store";
export { useChatActions } from "./use-chat-actions";
export { useChatRuntime } from "./use-chat-runtime";
export { defaultConvertMessage } from "./message-converter";
```

### 11. `src/index.ts` — Package Public API

```typescript
// Runtime
export { ChatRuntimeProvider } from "./provider/chat-runtime-provider";
export type { ChatRuntimeProviderProps } from "./provider/chat-runtime-provider";
export {
  useChatRuntime,
  useChatActions,
  useDefaultChatStore,
  SocketTransport,
  SSETransport,
  defaultConvertMessage,
} from "./runtime";
export type {
  ChatTransport,
  ChatTransportEvent,
  ChatTransportError,
  ChatTransportEvents,
  ChatTransportOptions,
  TransportContext,
  TransportRetryConfig,
  ChatStoreAdapter,
  ChatActions,
  ChatActionsConfig,
  ChatRuntimeConfig,
  SocketTransportConfig,
  SSETransportConfig,
} from "./runtime";

// Helpers
export {
  appendMessageToChatMessage,
  createStreamingAssistantMessage,
  updateAssistantMessageFromEvent,
  markMessageComplete,
  markMessageError,
} from "./helpers/message-helpers";

// Types
export type * from "./types";

// Components (existing)
export { Thread } from "./components/thread";
export { AssistantSidebar } from "./components/assistant-sidebar";
export { AssistantModal } from "./components/assistant-modal";
export { ThreadListSidebar } from "./components/thread-list-component";
export { MarkdownText } from "./components/markdown";
export { ToolFallback } from "./components/tool-fallback";
export { Reasoning } from "./components/reasoning";
export { TooltipIconButton } from "./components/tooltip-icon-button";
```

---

## Usage Patterns

### Basic — Socket with auto store

```tsx
import {
  ChatRuntimeProvider,
  SocketTransport,
  Thread,
} from "@ldc/chat-sdk";

const transport = new SocketTransport({
  baseUrl: env.PUBLIC_URL_PUSH_GATEWAY + "/v1/pushgateway",
  room: (ctx) => `run:${ctx.runId}`,
  channel: "data_chunk",
});

function AgentChat() {
  return (
    <ChatRuntimeProvider
      transport={transport}
      beforeSend={async (msgs) => {
        const { run_id } = await agentApi.post("/ai/chat", { messages: msgs });
        return { runId: run_id };
      }}
    >
      <Thread />
    </ChatRuntimeProvider>
  );
}
```

### Advanced — Zustand store + custom actions

```tsx
import {
  useChatActions,
  useChatRuntime,
  SocketTransport,
  Thread,
} from "@ldc/chat-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatStore } from "./stores/chat-store";

function AgentChat() {
  const store = {
    messages: useChatStore(s => s.messages),
    isRunning: useChatStore(s => s.isRunning),
    setMessages: useChatStore(s => s.setMessages),
    setIsRunning: useChatStore(s => s.setIsRunning),
  };

  const actions = useChatActions(transport, store, {
    beforeSend: async (msgs) => {
      analytics.track("message_sent", { count: msgs.length });
      const { run_id } = await agentApi.post("/ai/chat", { messages: msgs });
      return { runId: run_id };
    },
  });

  const runtime = useChatRuntime(store, actions);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
```

### SSE — Zero component changes

```tsx
import { ChatRuntimeProvider, SSETransport, Thread } from "@ldc/chat-sdk";

const transport = new SSETransport({
  url: "/api/ai/stream",
  buildBody: (messages) => ({ messages, model: "gpt-4" }),
});

function AgentChat() {
  return (
    <ChatRuntimeProvider transport={transport}>
      <Thread />
    </ChatRuntimeProvider>
  );
}
```

---

## Reuse Checklist

| Existing artifact | Reused in |
|---|---|
| `SocketClient` (`@ldc/api-sdk/socket`) | `SocketTransport` |
| emit-wait pattern (`autoform/executors/workflow.ts:73-182`) | `SocketTransport.send()` |
| `defaultConvertMessage` (`runtime/message-converter.ts`) | `useChatRuntime` via `useExternalMessageConverter` |
| `useExternalStoreRuntime` (`@assistant-ui/react`) | `useChatRuntime` |
| `useExternalMessageConverter` (`@assistant-ui/react`) | `useChatRuntime` |
| `AssistantRuntimeProvider` (`@assistant-ui/react`) | `ChatRuntimeProvider` |
| All `components/` files | Exported unchanged from `index.ts` |

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `runtime/transport/types.ts` | Protocol seam — typed events + callback API |
| Create | `runtime/store/types.ts` | Injectable store adapter interface |
| Create | `runtime/store/use-default-chat-store.ts` | Built-in useState store |
| Create | `runtime/use-chat-actions.ts` | Transport → store orchestration |
| Create | `runtime/use-chat-runtime.ts` | Store + actions → useExternalStoreRuntime |
| Create | `runtime/transport/socket-transport.ts` | Socket.IO implementation |
| Create | `runtime/transport/sse-transport.ts` | SSE/fetch-stream implementation |
| Create | `helpers/message-helpers.ts` | Pure message transformation functions |
| Create | `provider/chat-runtime-provider.tsx` | AssistantRuntimeProvider wrapper |
| Create | `runtime/index.ts` | Runtime re-exports |
| Modify | `src/index.ts` | Replace stub with full exports |

No existing files deleted. No existing components modified.

---

## Step-by-Step Implementation Order

Build order respects dependency graph — each step only imports what prior steps created.

| Step | File (relative to `src/`) | Type | Notes |
|------|--------------------------|------|-------|
| **0** | `package.json` | config | Add `@ldc/api-sdk: "workspace:*"` to deps; `socket.io-client: "catalog:"` to peerDeps + devDeps |
| **1** | `runtime/transport/types.ts` | pure TS | `ChatTransportEvent` union, `ChatTransportError`, `ChatTransportEvents`, `TransportContext`, `ChatTransportOptions`, `TransportRetryConfig`, `ChatTransport` interface |
| **2** | `runtime/store/types.ts` | pure TS | `ChatStoreAdapter` interface |
| **3** | `runtime/store/use-default-chat-store.ts` | React hook | `useDefaultChatStore(initialMessages?)` — wrap in `useMemo` for referential stability |
| **4** | `helpers/message-helpers.ts` | pure TS | Pure functions: `appendMessageToChatMessage`, `createStreamingAssistantMessage`, `updateAssistantMessageFromEvent`, `markMessageComplete`, `markMessageError` |
| **5** | `runtime/message-converter.ts` | re-export shim | `export { defaultConvertMessage } from "../types/message-converter"` — required because steps 6+10 import from `./message-converter` |
| **6** | `runtime/use-chat-runtime.ts` | React hook | Wires store + actions → `useExternalStoreRuntime` + `useExternalMessageConverter` |
| **7** | `runtime/use-chat-actions.ts` | React hook | Transport → store orchestration; keep both `transport` and `store` in refs to stabilize `onNew` with `deps: []` |
| **8** | `runtime/transport/socket-transport.ts` | class | **See critical API corrections below** |
| **9** | `runtime/transport/sse-transport.ts` | class | `fetch` + `ReadableStream` line reader; `anySignal` helper |
| **10** | `provider/chat-runtime-provider.tsx` | React component | `AssistantRuntimeProvider` wrapper; always call `useDefaultChatStore()` unconditionally |
| **11** | `runtime/index.ts` | barrel | Re-export all runtime public API |
| **12** | `src/index.ts` | modify | Replace `export const name = 'chat-sdk'` stub with full public API |

---

## Critical Corrections (planner review found these bugs in ARCHITECTURE.md)

### A. `SocketClient` API Mismatches — §6 pseudocode is wrong

| ARCHITECTURE.md pseudocode | Real `SocketClient` API |
|---|---|
| `new SocketClient(baseUrl, { namespace })` | `new SocketClient({ baseUrl, reconnection, ... })` |
| `socket.on(channel, handler)` directly | `SocketClient` has no `.on()` — call `client.connect(namespace)` → `ISocket`, then `iSocket.on()` |
| `socket.emit("wait", { room })` immediately | Must emit inside `socket.on("connect", ...)` — pre-connect emits are dropped |
| `socket.disconnectAll()` | `disconnectAll()` is on `SocketClient`, not `ISocket`; call `iSocket.off()` first to remove listeners |
| `namespace` in constructor config | No such field — pass namespace to `client.connect(namespace)` |

**Correct `SocketTransport.send()` pattern:**
```typescript
this.socket = new SocketClient({ baseUrl: this.config.baseUrl, reconnection: this.config.reconnect ?? true });
const iSocket = this.socket.connect(this.config.namespace ?? "/");
iSocket.on("connect", () => iSocket.emit("wait", { room }));
iSocket.on(this.config.channel, handler);
// dispose: iSocket.off(...), this.socket.disconnectAll()
```

### B. Import path bug in `helpers/message-helpers.ts`

ARCHITECTURE §8 imports `ChatTransportEvent` from `"../types"` — WRONG. Correct path: `"../runtime/transport/types"`.

### C. `useExternalMessageConverter` availability

Verify `useExternalMessageConverter` with `joinStrategy: "concat-content"` exists in `@assistant-ui/react` 0.12.25 before using. Fallback: pass `store.messages.map(convertMessage)` directly to `useExternalStoreRuntime`.

### D. `AppendMessage.content` text filter needs type-guard

```typescript
// Wrong (doesn't narrow):
.filter((c) => c.type === "text").map((c) => c.text)

// Correct:
.filter((c): c is { type: "text"; text: string } => c.type === "text").map((c) => c.text)
```

### E. `types/index.ts` barrel must exist

`src/index.ts` uses `export type * from "./types"` — requires a `types/index.ts` barrel. If it doesn't exist, create it or use explicit paths (`./types/message`, `./types/thread`, etc.).

### F. `setMessages` type compatibility

`useExternalStoreRuntime.setMessages` may not accept the updater-function overload from `ChatStoreAdapter`. If types clash, omit `setMessages` from the runtime config (store mutations happen via `onNew` callbacks anyway).

---

## Verification Checklist

- [ ] `package.json`: `@ldc/api-sdk` dep + `socket.io-client` peer/dev dep added
- [ ] `cd packages/chat-sdk && bun run typecheck` → zero errors
- [ ] `bun run lint` clean
- [ ] `types/index.ts` barrel exists
- [ ] All `components/` re-exports in `src/index.ts` resolve to real named exports
- [ ] `runtime/message-converter.ts` shim resolves `defaultConvertMessage`
- [ ] `SocketTransport`: connects, emits `wait` only after `connect` event, removes listeners on `dispose`
- [ ] `SSETransport`: streams, parses `data:` lines, ignores `[DONE]`, aborts cleanly on signal
- [ ] Swap `useAIAssistantRuntime` in `apps/workflow-management` → `ChatRuntimeProvider` + `SocketTransport` — chat works end-to-end
- [ ] Swap to `SSETransport` against mock endpoint — same `<Thread />` renders unchanged
- [ ] Disconnect socket mid-stream — error state renders; `retry` config triggers `onRetry`
- [ ] Inject zustand `ChatStoreAdapter` — messages persist across remounts
- [ ] Run `gitnexus_detect_changes()` before commit — only new files + `src/index.ts`/`package.json` affected