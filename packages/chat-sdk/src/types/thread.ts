export type ThreadStatus = "active" | "archived" | "deleted";

export interface ChatThread {
  id: string;

  title?: string;

  status?: ThreadStatus;

  createdAt?: Date | string;

  updatedAt?: Date | string;

  metadata?: Record<string, unknown>;
}

export interface ThreadListAdapter {
  threads: ChatThread[];

  activeThreadId: string;

  onSwitchThread: (threadId: string) => void;

  onNewThread: () => void | Promise<void>;

  onDeleteThread?: (threadId: string) => void | Promise<void>;

  onUpdateThread?: (
    threadId: string,
    updates: Partial<Pick<ChatThread, "title" | "status" | "metadata">>,
  ) => void | Promise<void>;
}
