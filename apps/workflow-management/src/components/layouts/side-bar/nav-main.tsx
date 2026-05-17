"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@ldc/ui/components/collapsible"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "@ldc/ui/components/sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {

    const { t } = useLanguage();

    const location = useLocation();
    const { pathname } = location;

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    if (item.items?.length) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={t(item.title)}>
                                            {item.icon && <item.icon />}
                                            <span>{t(item.title)}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                                        <Link to={subItem.url}>
                                                            <span>{t(subItem.title)}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )
                    }
                    return (
                        <SidebarMenuItem key={item.title}>
                            <Link to={item.url}>
                                <SidebarMenuButton tooltip={t(item.title)} isActive={pathname === item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{t(item.title)}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}
