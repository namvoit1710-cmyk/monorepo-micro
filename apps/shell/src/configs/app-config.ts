import { BotIcon, LayoutDashboard, UserIcon, Workflow } from "lucide-react";

export const appMenus = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/dashboard",
    },

    {
        title: "AI Assistants",
        icon: BotIcon,
        items: [
            {
                title: "AI Agent",
                url: "/agent",
            },
            {
                title: "History",
                url: "/history",
            },
        ],
    },

    {
        title: "Workflows",
        icon: Workflow,
        items: [
            {
                title: "Workflow List",
                url: "/workflows",
            },
            {
                title: "Execution",
                url: "/workflows/history",
            },
            {
                title: "Templates",
                url: "/workflows/templates",
            },
            {
                title: "Nodes Palette",
                url: "/workflows/palette",
            }
        ],
    },

    {
        title: "Features",
        icon: UserIcon,
        items: [
            {
                title: "User Management",
                url: "/features/user-management",
            },
            {
                title: "Feature Management",
                url: "/features/management",
            }
        ],
    },
]