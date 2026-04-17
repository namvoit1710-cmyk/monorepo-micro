import { cn } from "@ldc/ui";
import { forwardRef } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MdRendererProps {
    content: string;
    className?: string;
    onNavigate?: (slug: string) => void;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function createComponents(onNav?: (slug: string) => void): Components {
    return {
    h1: ({ children, ...props }) => (
        <h1
            id={slugify(String(children))}
            className="scroll-mt-20 text-3xl font-bold text-foreground mt-8 mb-4 pb-3 border-b border-border leading-snug"
            {...props}
        >
            {children}
        </h1>
    ),

    h2: ({ children, ...props }) => (
        <h2
            id={slugify(String(children))}
            className="scroll-mt-20 text-xl font-semibold text-foreground mt-10 mb-3 leading-snug"
            {...props}
        >
            {children}
        </h2>
    ),

    h3: ({ children, ...props }) => (
        <h3
            id={slugify(String(children))}
            className="scroll-mt-20 text-base font-semibold text-foreground mt-6 mb-2 leading-normal"
            {...props}
        >
            {children}
        </h3>
    ),

    h4: ({ children, ...props }) => (
        <h4
            id={slugify(String(children))}
            className="scroll-mt-20 text-xs font-semibold text-muted-foreground mt-5 mb-1.5 uppercase tracking-widest"
            {...props}
        >
            {children}
        </h4>
    ),

    p: ({ children }) => (
        <p className="text-[0.9375rem] leading-7 text-muted-foreground mb-4">
            {children}
        </p>
    ),

    a: ({ href, children }) => {
        const isInternal = href?.startsWith("./") && href.endsWith(".md");
        
        if (isInternal && onNav) {
            const slug = href.replace("./", "").replace(".md", "");
            return (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onNav(slug);
                    }}
                    className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                    {children}
                </button>
            );
        }

        return (
            <a
                href={href}
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        );
    },

    code: ({ className, children, ...props }) => {
        const isBlock = className?.includes("language-");
        const lang = className?.replace("language-", "") ?? "";

        if (isBlock) {
            return (
                <div className="relative my-5 group">
                    {lang ? (
                        <span className="absolute top-3 right-3 text-[10px] text-muted-foreground/50 font-mono select-none">
                            {lang}
                        </span>
                    ) : null}
                    <pre className="bg-card border border-border rounded-lg p-5 overflow-x-auto">
                        <code
                            className={cn(
                                "text-[0.8125rem] font-mono text-foreground leading-relaxed",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </code>
                    </pre>
                </div>
            );
        }

        return (
            <code
                className="bg-muted text-primary text-[0.8em] font-mono px-1.5 py-0.5 rounded border border-border"
                {...props}
            >
                {children}
            </code>
        );
    },

    blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-primary pl-4 py-2 pr-3 my-4 bg-accent rounded-r-md text-muted-foreground italic">
            {children}
        </blockquote>
    ),

    ul: ({ children }) => (
        <ul className="mb-4 pl-0 list-none space-y-1.5">
            {children}
        </ul>
    ),

    ol: ({ children }) => (
        <ol className="mb-4 pl-5 list-decimal space-y-1.5 marker:text-muted-foreground">
            {children}
        </ol>
    ),

    li: ({ children }) => (
        <li className="flex items-start gap-2 text-[0.9375rem] leading-7 text-muted-foreground">
            <span className="text-primary shrink-0 mt-[0.45rem] text-[0.4rem]">◆</span>
            <span>{children}</span>
        </li>
    ),

    table: ({ children }) => (
        <div className="my-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm border-collapse">
                {children}
            </table>
        </div>
    ),

    thead: ({ children }) => (
        <thead className="bg-muted">{children}</thead>
    ),

    tbody: ({ children }) => (
        <tbody className="divide-y divide-border">{children}</tbody>
    ),

    tr: ({ children }) => (
        <tr className="hover:bg-muted/40 transition-colors">{children}</tr>
    ),

    th: ({ children }) => (
        <th className="px-4 py-2.5 text-left text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">
            {children}
        </th>
    ),

    td: ({ children }) => (
        <td className="px-4 py-2.5 text-foreground align-top">
            {children}
        </td>
    ),

    hr: () => <hr className="border-none border-t border-border my-8" />,

    strong: ({ children }) => (
        <strong className="font-semibold text-foreground">{children}</strong>
    ),

    em: ({ children }) => (
        <em className="italic text-muted-foreground">{children}</em>
    ),
    };
}

export const MdRenderer = forwardRef<HTMLDivElement, MdRendererProps>(
    ({ content, className, onNavigate }, ref) => {
        return (
            <div ref={ref} className={cn("w-full", className)}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={createComponents(onNavigate)}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    }
);

MdRenderer.displayName = "MdRenderer";