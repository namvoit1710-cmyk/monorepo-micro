import {
    BookOpen,
    Settings2,
    SplinePointer,
    Workflow
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/layouts/side-bar/nav-main"
import { NavUser } from "@/components/layouts/side-bar/nav-user"
import { TeamSwitcher } from "@/components/layouts/side-bar/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@common/components/ui/sidebar"

const data = {
    user: {
        name: "admin",
        email: "admin@laidon.com",
        avatar: "",
    },

    navMain: [
        {
            title: "workflows",
            url: "/",
            icon: Workflow,
        },
        {
            title: "node_definitions.tab_title",
            url: "/node-definitions",
            icon: SplinePointer,
        },
        {
            title: "documentations",
            url: "#",
            icon: BookOpen,
            isActive: true,
            items: [
                {
                    title: "introduction",
                    url: "#",
                },
                {
                    title: "get_started",
                    url: "#",
                },
                {
                    title: "tutorials",
                    url: "#",
                },
                {
                    title: "changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "settings",
            url: "#",
            icon: Settings2,
            isActive: true,
            items: [
                {
                    title: "general",
                    url: "#",
                },
                {
                    title: "billing",
                    url: "#",
                }
            ],
        },
    ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {


    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
