"use client";

import type { TextMessagePartComponent } from "@assistant-ui/react";
import { memo } from "react";

/** Text message part component. Renders plain text content. */
const DirectiveTextImpl: TextMessagePartComponent = ({ text }) => (
    <span className="whitespace-pre-wrap">{text}</span>
);
DirectiveTextImpl.displayName = "DirectiveText";

export const DirectiveText: TextMessagePartComponent = memo(DirectiveTextImpl);
