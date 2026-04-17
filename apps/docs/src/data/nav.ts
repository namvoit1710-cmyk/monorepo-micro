export interface DocNavItem {
    id: string;
    title: string;
    slug: string;
    file: string; // path inside /docs/
    icon?: string;
}

export interface DocNavGroup {
    group: string;
    items: DocNavItem[];
}

export const DOC_NAV: DocNavGroup[] = [
    {
        group: "Getting Started",
        items: [
            {
                id: "introduction",
                title: "Introduction",
                slug: "introduction",
                file: "01-introduction.md",
                icon: "BookOpen",
            },
            {
                id: "installation",
                title: "Installation",
                slug: "installation",
                file: "02-installation.md",
                icon: "Terminal",
            },
        ],
    },
    {
        group: "Architecture",
        items: [
            {
                id: "structure",
                title: "Project Structure",
                slug: "structure",
                file: "03-structure.md",
                icon: "FolderTree",
            },
            {
                id: "tech-stack",
                title: "Tech Stack",
                slug: "tech-stack",
                file: "04-tech-stack.md",
                icon: "Layers",
            },
        ],
    },
    {
        group: "Reference",
        items: [
            {
                id: "packages",
                title: "Packages & APIs",
                slug: "packages",
                file: "05-packages-and-apis.md",
                icon: "Package",
            },
        ],
    },
    {
        group: "Build & Development",
        items: [
            {
                id: "bun",
                title: "Bun",
                slug: "bun",
                file: "bun.md",
            },
            {
                id: "rsbuild",
                title: "Rsbuild",
                slug: "rsbuild",
                file: "rsbuild.md",
            },
            {
                id: "turborepo",
                title: "Turborepo",
                slug: "turborepo",
                file: "turborepo.md",
            },
            {
                id: "t3-env",
                title: "T3 Env",
                slug: "t3-env",
                file: "t3-env.md",
            },
        ],
    },
    {
        group: "UI & Styling",
        items: [
            {
                id: "tailwindcss",
                title: "Tailwind CSS",
                slug: "tailwindcss",
                file: "tailwindcss.md",
            },
        ],
    },
    {
        group: "Data Management",
        items: [
            {
                id: "tanstack-query",
                title: "TanStack Query",
                slug: "tanstack-query",
                file: "tanstack-query.md",
            },
            {
                id: "tanstack-table",
                title: "TanStack Table",
                slug: "tanstack-table",
                file: "tanstack-table.md",
            },
            {
                id: "zustand",
                title: "Zustand",
                slug: "zustand",
                file: "zustand.md",
            },
        ],
    },
    {
        group: "Specialized Tools",
        items: [
            {
                id: "rete",
                title: "Rete.js",
                slug: "rete",
                file: "rete.md",
            },
        ],
    },
];

export const ALL_DOCS = DOC_NAV.flatMap((g) => g.items);

export function getDocBySlug(slug: string): DocNavItem | undefined {
    return ALL_DOCS.find((d) => d.slug === slug);
}

export function getAdjacentDocs(slug: string): {
    prev: DocNavItem | undefined;
    next: DocNavItem | undefined;
} {
    const idx = ALL_DOCS.findIndex((d) => d.slug === slug);
    return {
        prev: idx > 0 ? ALL_DOCS[idx - 1] : undefined,
        next: idx < ALL_DOCS.length - 1 ? ALL_DOCS[idx + 1] : undefined,
    };
}