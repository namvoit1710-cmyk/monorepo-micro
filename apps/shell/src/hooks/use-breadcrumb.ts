import { useMatches } from "react-router-dom";

export interface BreadcrumbItem {
    label: string;
    href: string;
}

interface RouteHandle {
    crumb?: string | ((data: unknown) => string);
}

export function useBreadcrumbs(): BreadcrumbItem[] {
    const matches = useMatches();

    return matches
        .filter((match) => {
            const handle = match.handle as RouteHandle | undefined;
            return Boolean(handle?.crumb);
        })
        .map((match) => {
            const handle = match.handle as RouteHandle;
            const label =
                typeof handle.crumb === "function"
                    ? handle.crumb(match.data)
                    : handle.crumb ?? "";
            return {
                label,
                href: match.pathname,
            };
        });
}