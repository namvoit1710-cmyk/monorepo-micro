import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@ldc/ui/components/sidebar";
import { Link } from "react-router-dom";

export interface ITeam {
  name: string;
  logo: React.ElementType;
  description: string;
}

export function TeamSwitcher({
  team,
}: {
  team: ITeam;
}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <team.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {team.name}
              </span>
              <span className="truncate text-xs">{team.description}</span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
