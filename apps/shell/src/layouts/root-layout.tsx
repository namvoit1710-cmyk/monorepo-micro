import { SidebarInset, SidebarProvider } from "@ldc/ui/components/sidebar";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/sidebar/app-sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <div className="flex-2 overflow-hidden p-4">
          <Outlet />
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
}
