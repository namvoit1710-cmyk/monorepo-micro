import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from "@ldc/ui/components/sidebar";
import { MessagesSquare } from "lucide-react";
import type * as React from "react";
import { ThreadList } from "./thread-list";

export function ThreadListSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="aui-sidebar-header mb-2 border-b">
                <div className="aui-sidebar-header-content flex items-center justify-between">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a
                                    href="https://assistant-ui.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <MessagesSquare className="aui-sidebar-header-icon size-4" />
                                    </div>
                                    <div className="aui-sidebar-header-heading me-6 flex flex-col gap-0.5 leading-none">
                                        <span className="aui-sidebar-header-title font-semibold">
                                            assistant-ui
                                        </span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarHeader>
            <SidebarContent className="aui-sidebar-content px-2">
                <ThreadList />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
