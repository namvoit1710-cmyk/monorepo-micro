import {
    BotIcon
} from "lucide-react";
import * as React from "react";

import { appMenus } from "@/configs/app-config";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@ldc/ui/components/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> { }

export function AppSidebar({ ...props }: AppSidebarProps) {

    const team = {
        name: "Ldc Mono.",
        logo: () => <BotIcon className="size-4" />,
        description: "Pro",
    }

    const menus = appMenus

    const user = {
        name: "John Doe",
        email: "",
        avatar: ""
    }

    return (
        <Sidebar collapsible="icon" {...props} variant="inset">
            <SidebarHeader>
                <TeamSwitcher team={team} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={menus}
                />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
