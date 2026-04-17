import { ScrollArea } from "@ldc/ui/components/scroll-area";
import { SidebarInset, SidebarProvider } from "@ldc/ui/components/sidebar";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/sidebar/app-sidebar";

export default function RootLayout() {
  return (
    <SidebarProvider className="overflow-hidden h-screen">
      <AppSidebar />

      <SidebarInset className="flex flex-col overflow-hidden">
        <AppHeader />

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
