"use client";

import {
    ThreadListItemPrimitive,
    ThreadListPrimitive,
} from "@assistant-ui/react";
import { cn } from "@ldc/ui";
import type { FC } from "react";

export const ThreadList: FC = () => {
    return (
        <ThreadListPrimitive.Root className="aui-thread-list-root flex flex-col gap-0.5 py-2">
            <ThreadListPrimitive.Items>
                {() => <ThreadListItem />}
            </ThreadListPrimitive.Items>
        </ThreadListPrimitive.Root>
    );
};

const ThreadListItem: FC = () => {
    return (
        <ThreadListItemPrimitive.Root
            className={cn(
                "aui-thread-list-item group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground data-[active=true]:font-medium",
            )}
        >
            <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger flex-1 truncate text-start">
                <span className="aui-thread-list-item-title truncate">
                    <ThreadListItemPrimitive.Title />
                </span>
            </ThreadListItemPrimitive.Trigger>
        </ThreadListItemPrimitive.Root>
    );
};
