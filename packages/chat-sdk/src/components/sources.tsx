"use client";

import type { SourceMessagePartComponent } from "@assistant-ui/react";
import { cn } from "@ldc/ui";
import { Badge, badgeVariants } from "@ldc/ui/components/badge";
import { type VariantProps } from "class-variance-authority";

import { memo, useState, type ComponentProps } from "react";

const extractDomain = (url: string): string => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};

const defaultFaviconUrl = (domain: string) =>
    `https://icons.duckduckgo.com/ip3/${domain}.ico`;

function SourceIcon({
    url,
    className,
    faviconUrl = defaultFaviconUrl,
    ...props
}: ComponentProps<"span"> & {
    url: string;
    faviconUrl?: (domain: string) => string;
}) {
    const domain = extractDomain(url);
    const src = faviconUrl(domain);
    const [errorSrc, setErrorSrc] = useState<string | undefined>(undefined);
    const hasError = errorSrc === src;

    if (hasError) {
        return (
            <span
                data-slot="source-icon-fallback"
                className={cn(
                    "flex size-3 shrink-0 items-center justify-center rounded-sm bg-muted font-medium text-[10px]",
                    className,
                )}
                {...props}
            >
                {domain.charAt(0).toUpperCase() || "?"}
            </span>
        );
    }

    return (
        <img
            data-slot="source-icon"
            src={src}
            alt=""
            className={cn("size-3 shrink-0 rounded-sm", className)}
            onError={() => setErrorSrc(src)}
            {...(props as ComponentProps<"img">)}
        />
    );
}

function SourceTitle({ className, ...props }: ComponentProps<"span">) {
    return (
        <span
            data-slot="source-title"
            className={cn("max-w-37.5 truncate", className)}
            {...props}
        />
    );
}


export type SourceProps = VariantProps<typeof badgeVariants> &
    ComponentProps<"a"> & {
        asChild?: boolean;
    };

function Source({
    className,
    variant,
    asChild = false,
    target = "_blank",
    rel = "noopener noreferrer",
    ...props
}: SourceProps) {
    return (
        <Badge
            asChild
            variant={variant}
            className={cn(
                "cursor-pointer rounded-full px-2.5 py-0.5 gap-1 text-xs font-normal outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                className,
            )}
        >
            <a
                data-slot="source"
                target={target}
                rel={rel}
                {...(props as ComponentProps<"a">)}
            />
        </Badge>
    );
}

const SourcesImpl: SourceMessagePartComponent = (part) => {
    if (part.sourceType === "url" && part.url) {
        const domain = extractDomain(part.url);
        const displayTitle = part.title || domain;

        return (
            <Source href={part.url}>
                <SourceIcon url={part.url} />
                <SourceTitle>{displayTitle}</SourceTitle>
            </Source>
        );
    }

    return null;
};

const Sources = memo(SourcesImpl) as unknown as SourceMessagePartComponent & {
    Root: typeof Source;
    Icon: typeof SourceIcon;
    Title: typeof SourceTitle;
};

Sources.displayName = "Sources";
Sources.Root = Source;
Sources.Icon = SourceIcon;
Sources.Title = SourceTitle;

export {
    Source,
    SourceIcon, Sources, SourceTitle,
    badgeVariants as sourceVariants
};

