import type { ChatMessage } from "../../types/message";

export interface ChatStoreAdapter {
  messages: readonly ChatMessage[];
  isRunning: boolean;
  setMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void;
  setIsRunning: (running: boolean) => void;
}
