import type { AppendMessage, ThreadMessageLike } from "@assistant-ui/react";
import type { ChatMessage } from "./message";
import type { ThreadListAdapter } from "./thread";

export interface ChatAdapter {
  messages: readonly ChatMessage[];

  isRunning: boolean;

  onNew: (message: AppendMessage) => Promise<void>;

  onCancel?: () => void;

  onReload?: (parentId: string) => Promise<void>;

  onEdit?: (message: AppendMessage) => Promise<void>;

  setMessages?: (messages: ChatMessage[]) => void;

  convertMessage?: (message: ChatMessage) => ThreadMessageLike;

  threadList?: ThreadListAdapter;

  capabilities?: ChatAdapterCapabilities;
}

export interface ChatAdapterCapabilities {
  cancel?: boolean;
  reload?: boolean;
  edit?: boolean;
  branches?: boolean;
  attachments?: boolean;
  markdown?: boolean;
  codeHighlight?: boolean;
}

export interface ChatAttachmentAdapter {
  accept: string;

  add: (params: { file: File }) => Promise<ChatAttachmentState>;

  remove: (attachment: ChatAttachmentState) => Promise<void>;

  send: (attachment: ChatAttachmentState) => Promise<ChatAttachmentState>;
}

export interface ChatAttachmentState {
  id: string;
  type: string;
  name: string;
  contentType?: string;
  file?: File;
  url?: string;
  status: { type: "pending" } | { type: "complete" } | { type: "error"; message: string };
}
