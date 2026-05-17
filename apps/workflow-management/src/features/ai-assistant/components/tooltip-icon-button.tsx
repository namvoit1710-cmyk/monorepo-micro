"use client";

import { Slot } from "radix-ui";
import { ComponentPropsWithRef, forwardRef } from "react";

import { Button } from "@common/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@common/components/ui/tooltip";
import { cn } from "@common/lib/utils";

export type TooltipIconButtonProps = ComponentPropsWithRef<typeof Button> & {
    tooltip: string;
    side?: "top" | "bottom" | "left" | "right";
};

export const TooltipIconButton = forwardRef<
    HTMLButtonElement,
    TooltipIconButtonProps
>(({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        {...rest}
                        className={cn("aui-button-icon size-6 p-1", className)}
                        ref={ref}
                    >
                        <Slot.Slottable>{children}</Slot.Slottable>
                        <span className="aui-sr-only sr-only">{tooltip}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side={side}>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

TooltipIconButton.displayName = "TooltipIconButton";
