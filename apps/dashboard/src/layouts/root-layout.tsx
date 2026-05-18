import { AssistantModal } from "@ldc/chat-sdk";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@ldc/ui/components/sidebar";
import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const RootLayout = () => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
          <span className="font-bold text-xl tracking-tight text-primary">LDC Dashboard</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                    <Link to="/">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/chat"}>
                    <Link to="/chat">
                      <MessageSquare />
                      <span>AI Assistant</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
                    <Link to="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden w-full">
        <header className="h-16 flex items-center px-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="h-full p-4 lg:p-6">
            <Outlet />
            <AssistantModal />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default RootLayout;
