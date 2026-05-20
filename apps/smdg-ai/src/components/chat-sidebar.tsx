import { PlusIcon, User, GitBranch } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@ldc/ui/components/sidebar";
import { ThreadList } from "@ldc/chat-sdk";
import { useWorkspaceStore } from "../stores/workspace-store";

interface ChatSidebarProps {
  onNewChat: () => void;
}

export function ChatSidebar({ onNewChat }: ChatSidebarProps) {
  const toggle = useWorkspaceStore((s) => s.toggle);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/50 pb-2">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-sm font-semibold text-foreground">SMDG AI</span>
          <button
            type="button"
            onClick={() => toggle()}
            title="Toggle workspace"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GitBranch aria-hidden="true" className="size-4" />
          </button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewChat}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <PlusIcon aria-hidden="true" className="size-4 shrink-0" />
              New Chat
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1">
        <ThreadList />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                <User aria-hidden="true" className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-foreground">User</span>
                <span className="text-xs text-muted-foreground">Free plan</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
