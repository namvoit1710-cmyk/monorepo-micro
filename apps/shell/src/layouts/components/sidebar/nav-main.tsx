"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ldc/ui/components/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@ldc/ui/components/sidebar";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export interface INavItem {
	title: string;
	url?: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		icon?: LucideIcon;
		title: string;
		url: string;
	}[];
}

export function NavMain({
	items,
}: {
	items: INavItem[];
}) {

	const { pathname } = useLocation();

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					if (item.items?.length) {
						return (
							<Collapsible
								key={item.title}
								asChild
								defaultOpen={true}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>

									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
														<Link to={subItem.url}>
															<span>{subItem.title}</span>
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
							<Link to={item.url ?? "#"}>
								<SidebarMenuButton tooltip={item.title} isActive={pathname === item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
