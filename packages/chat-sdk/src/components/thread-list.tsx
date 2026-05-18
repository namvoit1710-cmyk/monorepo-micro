"use client";

import {
    ThreadListItemPrimitive,
    ThreadListPrimitive,
} from "@assistant-ui/react";
import { cn } from "@ldc/ui";
import { Button } from "@ldc/ui/components/button";
import { PlusIcon } from "lucide-react";
import type { FC } from "react";

export const ThreadList: FC = () => {
    return (
        <ThreadListPrimitive.Root className="aui-thread-list-root flex flex-col gap-0.5">
            <ThreadListPrimitive.New asChild>
                <Button
                    variant="ghost"
                    className="aui-thread-list-new flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm"
                >
                    <PlusIcon className="size-4 shrink-0" />
                    New Thread
                </Button>
            </ThreadListPrimitive.New>
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
                "aui-thread-list-item group flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                "hover:bg-accent data-[active=true]:bg-accent",
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
