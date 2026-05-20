import type { ThreadMessageLike } from "@assistant-ui/react";
import {
  useExternalMessageConverter,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useMemo } from "react";
import type { ChatMessage } from "../types/message";
import { defaultConvertMessage } from "./message-converter";
import type { ChatStoreAdapter } from "./store/types";
import type { ChatActions } from "./use-chat-actions";

export interface ChatThreadListAdapter {
  threadId?: string;
  threads?: readonly { status: "regular"; id: string; title?: string }[];
  onSwitchToThread?: (threadId: string) => void | Promise<void>;
  onSwitchToNewThread?: () => void | Promise<void>;
}

export interface ChatRuntimeConfig {
  convertMessage?: (message: ChatMessage) => ThreadMessageLike;
  joinStrategy?: "concat-content" | "none";
  onUpload?: (file: File) => Promise<{ id: string; url: string; contentType?: string }>;
  threadList?: ChatThreadListAdapter;
}

export function useChatRuntime(
  store: ChatStoreAdapter,
  actions: ChatActions,
  config?: ChatRuntimeConfig,
) {
  const convertedMessages = useExternalMessageConverter({
    callback: config?.convertMessage ?? defaultConvertMessage,
    messages: store.messages as ChatMessage[],
    isRunning: store.isRunning,
    joinStrategy: config?.joinStrategy ?? "none",
  });

  const onUpload = config?.onUpload;
  const attachmentsAdapter = useMemo(() => {
    if (!onUpload) return undefined;
    return {
      accept: "*",
      add: async ({ file }: { file: File }) => ({
        id: crypto.randomUUID(),
        type: file.type.startsWith("image/")
          ? ("image" as const)
          : file.type === "application/pdf"
            ? ("document" as const)
            : ("file" as const),
        name: file.name,
        contentType: file.type,
        file,
        status: { type: "requires-action" as const, reason: "composer-send" as const },
      }),
      remove: async () => { },
      send: async (attachment: { id: string; type: string; name: string; contentType?: string; file: File }) => {
        const result = await onUpload(attachment.file);
        const attachmentType = attachment.type as "image" | "document" | "file";
        return {
          id: result.id,
          type: attachmentType,
          name: attachment.name,
          contentType: result.contentType ?? attachment.contentType,
          url: result.url,
          status: { type: "complete" as const },
          content: attachmentType === "image"
            ? [{ type: "image" as const, image: result.url }]
            : [],
        };
      },
    };
  }, [onUpload]);

  const threadList = config?.threadList;

  return useExternalStoreRuntime({
    messages: convertedMessages,
    isRunning: store.isRunning,
    onNew: actions.onNew,
    onCancel: actions.onCancel,
    adapters: {
      ...(attachmentsAdapter ? { attachments: attachmentsAdapter } : {}),
      ...(threadList ? { threadList } : {}),
    },
  });
}
