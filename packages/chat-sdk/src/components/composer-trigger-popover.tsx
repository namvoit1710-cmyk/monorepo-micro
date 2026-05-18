"use client";

import { memo, type FC } from "react";

type IconComponent = FC<{ className?: string }>;

type TriggerItem = { id: string; label: string; description?: string; metadata?: Record<string, unknown> };

type DirectiveBehaviorProps = {
    formatter?: undefined;
    onInserted?: ((item: TriggerItem) => void) | undefined;
};

type ActionBehaviorProps = {
    formatter?: undefined;
    onExecute: (item: TriggerItem) => void;
    removeOnExecute?: boolean | undefined;
};

export type ComposerTriggerPopoverProps = {
    iconMap?: Record<string, IconComponent>;
    fallbackIcon?: IconComponent;
    backLabel?: string;
    emptyCategoriesLabel?: string;
    emptyItemsLabel?: string;
    className?: string;
} & (
    | { directive: DirectiveBehaviorProps; action?: never }
    | { action: ActionBehaviorProps; directive?: never }
);

const ComposerTriggerPopoverImpl: FC<ComposerTriggerPopoverProps> = () => null;
ComposerTriggerPopoverImpl.displayName = "ComposerTriggerPopover";

export const ComposerTriggerPopover = memo(ComposerTriggerPopoverImpl) as FC<ComposerTriggerPopoverProps>;
