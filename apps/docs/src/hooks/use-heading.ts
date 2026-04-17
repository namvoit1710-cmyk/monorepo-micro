import { useEffect, useState } from "react";

export interface Heading {
    id: string;
    text: string;
    level: number;
}

export function useHeadings(containerRef: React.RefObject<HTMLElement | null>): Heading[] {
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const nodes = containerRef.current.querySelectorAll("h1, h2, h3, h4");
        const items: Heading[] = Array.from(nodes).map((node) => ({
            id: node.id,
            text: node.textContent,
            level: parseInt(node.tagName.slice(1), 10),
        }));
        setHeadings(items);
    }, [containerRef]);

    return headings;
}

export function useActiveHeading(headings: Heading[]): string {
    const [active, setActive] = useState<string>("");

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                        break;
                    }
                }
            },
            { rootMargin: "0px 0px -70% 0px", threshold: 0 }
        );

        headings.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    return active;
}