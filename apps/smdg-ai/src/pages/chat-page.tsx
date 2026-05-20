import { useOutletContext, useParams } from "react-router-dom";
import { Thread } from "@ldc/chat-sdk";
import { WelcomeScreen } from "../components/welcome-screen";

interface ChatOutletContext {
  onSuggestion: (text: string) => void;
}

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const context = useOutletContext<ChatOutletContext | null>();
  if (!context) throw new Error("ChatPage must be rendered inside ChatLayout");
  const { onSuggestion } = context;

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <WelcomeScreen onSuggestion={onSuggestion} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Thread />
    </div>
  );
}
