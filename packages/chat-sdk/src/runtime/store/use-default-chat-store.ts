import { useState, useCallback, useMemo } from "react";
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

  return useMemo(
    () => ({
      messages,
      isRunning,
      setMessages: stableSetMessages,
      setIsRunning,
    }),
    [messages, isRunning, stableSetMessages],
  );
}
