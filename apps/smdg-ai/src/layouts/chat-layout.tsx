import { useCallback, useMemo, useRef, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  AssistantRuntimeProvider,
  useDefaultChatStore,
  useChatActions,
  useChatRuntime,
} from "@ldc/chat-sdk";
import { SidebarInset, SidebarProvider } from "@ldc/ui/components/sidebar";
import { MockTransport } from "../mocks/mock-transport";
import { MOCK_THREADS, MOCK_HISTORY_MESSAGES } from "../mocks/mock-data";
import { useWorkspaceStore } from "../stores/workspace-store";
import { ChatSidebar } from "../components/chat-sidebar";
import { WorkspacePanel } from "../components/workspace-panel";

function useConversationNavigation() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  const navigateToConversation = useCallback(
    (id: string) => navigate(`/chat/${id}`),
    [navigate],
  );

  const startNewChat = useCallback(() => navigate("/"), [navigate]);

  return { conversationId, navigateToConversation, startNewChat };
}

export function ChatLayout() {
  const { conversationId, navigateToConversation, startNewChat } =
    useConversationNavigation();

  const store = useDefaultChatStore();
  const { resetSteps } = useWorkspaceStore();

  // Stable transport — created once per layout mount
  const transport = useMemo(() => new MockTransport(), []);

  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  const beforeSend = useCallback(async () => {
    resetSteps();
    const currentId = conversationIdRef.current;
    const convId = currentId ?? `conv_${Date.now()}`;
    if (!currentId) {
      navigateToConversation(convId);
    }
    return {
      runId: `run_${Date.now()}`,
      conversationId: convId,
    };
  }, [navigateToConversation, resetSteps]);

  const actions = useChatActions(transport, store, { beforeSend });

  const { setMessages } = store;

  // Load mock history messages when selecting a mock conversation,
  // or clear the messages when navigating to the new chat screen.
  useEffect(() => {
    if (conversationId && conversationId in MOCK_HISTORY_MESSAGES) {
      const messages = MOCK_HISTORY_MESSAGES[conversationId];
      if (messages) {
        setMessages(messages);
      }
    } else if (!conversationId) {
      setMessages([]);
    }
  }, [conversationId, setMessages]);

  const threadListAdapter = useMemo(
    () => ({
      threadId: conversationId,
      threads: MOCK_THREADS.map((t) => ({
        status: "regular" as const,
        id: t.id,
        title: t.title,
      })),
      onSwitchToThread: (id: string) => {
        setMessages([]);
        navigateToConversation(id);
      },
      onSwitchToNewThread: () => {
        setMessages([]);
        startNewChat();
      },
    }),
    [conversationId, navigateToConversation, startNewChat, setMessages],
  );

  const mockOnUpload = useCallback(async (file: File) => {
    await new Promise((r) => setTimeout(r, 400));
    return { id: crypto.randomUUID(), url: URL.createObjectURL(file), contentType: file.type };
  }, []);

  const runtime = useChatRuntime(store, actions, { threadList: threadListAdapter, onUpload: mockOnUpload });

  const handleSuggestion = useCallback(
    (text: string) => {
      void actions.onNew({
        role: "user" as const,
        content: [{ type: "text" as const, text }],
        attachments: [],
        metadata: { custom: {} },
        createdAt: new Date(),
        parentId: null,
        sourceId: null,
        runConfig: undefined,
      });
    },
    [actions],
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <ChatSidebar onNewChat={startNewChat} />
          <SidebarInset className="flex flex-1 overflow-hidden">
            <Outlet context={{ onSuggestion: handleSuggestion }} />
          </SidebarInset>
          <WorkspacePanel />
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
}
