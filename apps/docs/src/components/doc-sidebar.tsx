import { cn } from "@ldc/ui";
import { Separator } from "@ldc/ui/components/separator";
import type { LucideIcon } from "lucide-react";
import {
    BookOpen,
    FolderTree,
    Layers,
    Package,
    Terminal
} from "lucide-react";

import { DOC_NAV } from "@/data/nav";
import { DocSearch } from "./doc-search";

const iconMap: Record<string, LucideIcon> = {
    BookOpen,
    Terminal,
    FolderTree,
    Layers,
    Package,
};

interface DocSidebarProps {
    activeSlug: string;
    onSelect: (slug: string) => void;
}

export function DocSidebar({ activeSlug, onSelect }: DocSidebarProps) {
    return (
        <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
                    <BookOpen size={14} className="text-sidebar-primary-foreground" />
                </div>
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                    LDC Docs
                </span>
            </div>

            {/* Search */}
            <div className="px-3 py-3 border-b border-sidebar-border">
                <DocSearch onSelect={onSelect} />
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-2 py-3">
                <nav className="flex flex-col gap-5">
                    {DOC_NAV.map((group) => (
                        <div key={group.group} className="flex flex-col gap-1">
                            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                {group.group}
                            </p>
                            <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
                                {group.items.map((item) => {
                                    const Icon = (item.icon && iconMap[item.icon]) ?? BookOpen;
                                    const isActive = item.slug === activeSlug;

                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => onSelect(item.slug)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm",
                                                    "border-none cursor-pointer transition-colors duration-100",
                                                    isActive
                                                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                                                        : "bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                                                )}
                                            >
                                                <Icon
                                                    size={13}
                                                    className={cn(
                                                        "shrink-0",
                                                        isActive
                                                            ? "text-sidebar-primary"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                                {item.title}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-sidebar-border">
                <Separator className="mb-3" />
                <p className="text-[10px] text-muted-foreground/50 text-center">
                    LDC Frontend Docs
                </p>
            </div>
        </aside>
    );
}