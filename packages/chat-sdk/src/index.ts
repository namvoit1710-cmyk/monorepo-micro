// Runtime
export { AssistantRuntimeProvider } from "@assistant-ui/react";
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
  ChatTransportMiddleware,
  ChatTransportOptions,
  TransportContext,
  TransportRetryConfig,
  ChatStoreAdapter,
  ChatActions,
  ChatActionsConfig,
  ChatRuntimeConfig,
  ChatThreadListAdapter,
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
  editUserMessage,
  removeLastAssistantMessage,
} from "./helpers/message-helpers";

// Types
export type * from "./types";

// Components
export { Thread } from "./components/thread";
export type { ThreadTools } from "./components/thread";
export { AssistantSidebar } from "./components/assistant-sidebar";
export { AssistantModal } from "./components/assistant-modal";
export { ThreadListSidebar } from "./components/thread-list-component";
export { ThreadList } from "./components/thread-list";
export { MarkdownText } from "./components/markdown";
export { ToolFallback } from "./components/tool-fallback";
export { Reasoning } from "./components/reasoning";
export { TooltipIconButton } from "./components/tooltip-icon-button";